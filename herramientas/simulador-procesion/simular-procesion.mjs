#!/usr/bin/env node
// Simulador de una procesión en curso para probar el seguimiento en vivo
// (RF-24 compartir ubicación, RF-25 descartar ubicaciones erróneas, estela
// en el Mapa en Vivo) sin tener que salir a la calle con varios móviles.
//
// Hace lo mismo que la app del cofrade: entra con un código de acceso
// (POST /auth/codigo-acceso) y manda pings (POST /procesiones/{id}/posiciones),
// pero por N cofrades virtuales repartidos a lo largo del cortejo, que
// avanzan por el recorrido real de la procesión (el GPX importado).
//
// Sin dependencias: Node 18 o superior (usa fetch y util.parseArgs).
//   node herramientas/simulador-procesion/simular-procesion.mjs --ayuda

import { parseArgs } from 'node:util';

const AYUDA = `
Simulador de procesión · Semana Santa App

Uso:
  node simular-procesion.mjs --procesion <id> --codigo <código de cofrade> [opciones]
  node simular-procesion.mjs --listar --ciudad <id>

Obligatorias:
  --procesion <id>       Procesión a simular (debe tener recorrido importado).
  --codigo <código>      Código de acceso de cofrade de una cofradía participante
                         (Junta → Cofradías → Códigos de acceso).

Simulación:
  --cofrades <n>         Cofrades virtuales compartiendo ubicación (5).
  --longitud <m>         Metros entre la cabeza y la cola del cortejo (250).
  --velocidad <km/h>     Velocidad de la procesión (1.5; una real va a 1-2 km/h).
  --acelerar <x>         Factor de aceleración del tiempo (10: 1 s real = 10 s).
  --intervalo <s>        Segundos reales entre rondas de pings (10).
  --ruido <m>            Error típico del GPS en metros (5).
  --erroneos <0-1>       Proporción de pings erróneos, lejos del recorrido, para
                         comprobar que se descartan (RF-25) (0.05).
  --desde <0-1>          Fracción del recorrido donde empieza la cabeza (0).

Estado de la procesión (requieren --junta-email y --junta-password):
  --iniciar              Pone la procesión EN CURSO antes de empezar.
  --finalizar            La pone FINALIZADA al llegar la cola al final.
                         (Los ciudadanos reciben los avisos "Ha comenzado" / "Ha finalizado".)

Otras:
  --api <url>            Backend (http://localhost:8080, o la variable SIMULADOR_API).
  --listar               Lista las procesiones de --ciudad <id> con su estado.
  --ayuda                Esta ayuda.

Ejemplo (procesión 3, 8 cofrades, 20 veces más rápido, iniciándola y finalizándola):
  node simular-procesion.mjs --procesion 3 --codigo AB12CD34 --cofrades 8 --acelerar 20 \\
       --iniciar --finalizar --junta-email junta@ejemplo.es --junta-password '...'
`;

// ---------------------------------------------------------------- opciones

const { values: op } = parseArgs({
  options: {
    procesion: { type: 'string' },
    codigo: { type: 'string' },
    cofrades: { type: 'string', default: '5' },
    longitud: { type: 'string', default: '250' },
    velocidad: { type: 'string', default: '1.5' },
    acelerar: { type: 'string', default: '10' },
    intervalo: { type: 'string', default: '10' },
    ruido: { type: 'string', default: '5' },
    erroneos: { type: 'string', default: '0.05' },
    desde: { type: 'string', default: '0' },
    iniciar: { type: 'boolean', default: false },
    finalizar: { type: 'boolean', default: false },
    'junta-email': { type: 'string' },
    'junta-password': { type: 'string' },
    api: { type: 'string', default: process.env.SIMULADOR_API ?? 'http://localhost:8080' },
    listar: { type: 'boolean', default: false },
    ciudad: { type: 'string' },
    ayuda: { type: 'boolean', short: 'h', default: false },
  },
});

const API = op.api.replace(/\/+$/, '');

function numero(nombre, { min = -Infinity, max = Infinity, entero = false } = {}) {
  const valor = Number(op[nombre]);
  if (!Number.isFinite(valor) || valor < min || valor > max || (entero && !Number.isInteger(valor))) {
    salir(`--${nombre} no es válido: "${op[nombre]}"`);
  }
  return valor;
}

// Error que corta la simulación. Se lanza y se captura arriba, en vez de
// llamar a process.exit(): en Windows, salir con conexiones de fetch aún
// abiertas hace que Node aborte con "Assertion failed ... UV_HANDLE_CLOSING".
class ErrorSimulador extends Error {}

function salir(mensaje) {
  throw new ErrorSimulador(mensaje);
}

// ---------------------------------------------------------------- API

async function api(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    const error = new Error(`No se ha podido conectar con ${API} (${err.cause?.code ?? err.name}). ¿Está arrancado el backend?`);
    error.sinConexion = true;
    throw error;
  }
  const texto = await respuesta.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }
  if (!respuesta.ok) {
    const mensaje = datos?.mensaje ?? (datos ? JSON.stringify(datos) : `HTTP ${respuesta.status}`);
    const error = new Error(mensaje);
    error.status = respuesta.status;
    throw error;
  }
  return { status: respuesta.status, datos };
}

// ---------------------------------------------------------------- geometría

const RADIO_TIERRA_M = 6371000;
const METROS_POR_GRADO_LAT = 111320;

function distanciaMetros(a, b) {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Distancias acumuladas desde el inicio, para poder situar un punto "a X
// metros del inicio" interpolando dentro de su tramo.
function prepararRuta(puntos) {
  const acumulado = [0];
  for (let i = 1; i < puntos.length; i++) {
    acumulado.push(acumulado[i - 1] + distanciaMetros(puntos[i - 1], puntos[i]));
  }
  return { puntos, acumulado, total: acumulado[acumulado.length - 1] };
}

function puntoADistancia(ruta, metros) {
  const d = Math.max(0, Math.min(ruta.total, metros));
  let i = 1;
  while (i < ruta.acumulado.length - 1 && ruta.acumulado[i] < d) i++;
  const inicio = ruta.acumulado[i - 1];
  const largo = ruta.acumulado[i] - inicio || 1;
  const t = (d - inicio) / largo;
  const a = ruta.puntos[i - 1];
  const b = ruta.puntos[i];
  return { lat: a.lat + t * (b.lat - a.lat), lon: a.lon + t * (b.lon - a.lon) };
}

// Desplaza un punto `metros` en una dirección aleatoria (para el ruido del
// GPS y para los pings erróneos).
function desplazar(punto, metros) {
  const angulo = Math.random() * 2 * Math.PI;
  const metrosPorGradoLon = METROS_POR_GRADO_LAT * Math.cos((punto.lat * Math.PI) / 180);
  return {
    lat: punto.lat + (metros * Math.sin(angulo)) / METROS_POR_GRADO_LAT,
    lon: punto.lon + (metros * Math.cos(angulo)) / metrosPorGradoLon,
  };
}

// Distancia mínima de un punto al recorrido (a cualquiera de sus tramos),
// en un plano local: suficiente a escala de calles.
function distanciaARuta(ruta, p) {
  const metrosPorGradoLon = METROS_POR_GRADO_LAT * Math.cos((p.lat * Math.PI) / 180);
  let minima = Infinity;
  for (let i = 1; i < ruta.puntos.length; i++) {
    const a = ruta.puntos[i - 1];
    const b = ruta.puntos[i];
    const bx = (b.lon - a.lon) * metrosPorGradoLon;
    const by = (b.lat - a.lat) * METROS_POR_GRADO_LAT;
    const px = (p.lon - a.lon) * metrosPorGradoLon;
    const py = (p.lat - a.lat) * METROS_POR_GRADO_LAT;
    const largo2 = bx * bx + by * by;
    const t = largo2 ? Math.max(0, Math.min(1, (px * bx + py * by) / largo2)) : 0;
    minima = Math.min(minima, Math.hypot(px - t * bx, py - t * by));
  }
  return minima;
}

// Ping erróneo (RF-25): un salto del GPS de 150-400 m, pero comprobando que
// no cae cerca de OTRA parte del recorrido -en uno que da vueltas por la
// ciudad podría quedar a menos de 50 m de otro tramo, y entonces guardarlo
// sería lo correcto, no un fallo-. Margen de 100 m sobre el umbral.
const DISTANCIA_MINIMA_ERRONEO_M = 100;

function posicionErronea(ruta, real) {
  let candidata = desplazar(real, 150 + Math.random() * 250);
  for (let intento = 0; intento < 30 && distanciaARuta(ruta, candidata) < DISTANCIA_MINIMA_ERRONEO_M; intento++) {
    candidata = desplazar(real, 150 + Math.random() * 400);
  }
  return candidata;
}

// Normal(0, sigma) por Box-Muller: casi todos los pings caen a pocos metros,
// alguno algo más lejos, como un GPS de móvil en la calle.
function errorGps(sigma) {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.abs(sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}

// ---------------------------------------------------------------- utilidades

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));
const porcentaje = (fraccion) => `${(fraccion * 100).toFixed(1)}%`;
const hora = () => new Date().toLocaleTimeString('es-ES');

function barra(cola, cabeza, ancho = 40) {
  const desde = Math.round(cola * ancho);
  const hasta = Math.max(desde + 1, Math.round(cabeza * ancho));
  return '[' + '·'.repeat(desde) + '█'.repeat(Math.min(ancho, hasta) - desde) + '·'.repeat(Math.max(0, ancho - hasta)) + ']';
}

function cuerpoProcesion(p, estado) {
  // PUT /procesiones/{id} sustituye el recurso entero: se reenvía tal cual,
  // cambiando solo el estado (pasosIds null = no tocar los pasos).
  return {
    nombre: p.nombre, historia: p.historia, tradicion: p.tradicion, fecha: p.fecha,
    cofradiaIds: p.cofradiaIds, ubicacionId: p.ubicacionId, web: p.web,
    fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, recorridoId: p.recorridoId,
    pasosIds: null, estado,
  };
}

async function tokenDeJunta() {
  const email = op['junta-email'];
  const password = op['junta-password'];
  if (!email || !password) salir('--iniciar y --finalizar necesitan --junta-email y --junta-password.');
  const { datos } = await api('/auth/login', { metodo: 'POST', cuerpo: { email, password } });
  if (datos.rol !== 'JUNTA') salir(`Esa cuenta es de rol ${datos.rol}, no de Junta.`);
  return datos.token;
}

async function cambiarEstado(procesionId, estado, tokenJunta) {
  const { datos: procesion } = await api(`/procesiones/${procesionId}`);
  await api(`/procesiones/${procesionId}`, { metodo: 'PUT', cuerpo: cuerpoProcesion(procesion, estado), token: tokenJunta });
}

// ---------------------------------------------------------------- comandos

async function listar() {
  if (!op.ciudad) salir('--listar necesita --ciudad <id>.');
  const { datos } = await api(`/procesiones?ciudadId=${op.ciudad}`);
  if (datos.length === 0) {
    console.log('Esa ciudad no tiene procesiones.');
    return;
  }
  console.log('\n id  estado       recorrido  nombre');
  for (const p of datos) {
    console.log(` ${String(p.id).padEnd(3)} ${p.estado.padEnd(12)} ${(p.recorridoId ? 'sí' : 'NO').padEnd(10)} ${p.nombre}`);
  }
  console.log('\nSolo se pueden simular las que tienen recorrido importado (GPX).\n');
}

async function simular() {
  if (!op.procesion) salir('Falta --procesion <id> (usa --listar --ciudad <id> para ver cuáles hay).');
  if (!op.codigo) salir('Falta --codigo <código de acceso de cofrade>.');

  const numCofrades = numero('cofrades', { min: 1, max: 200, entero: true });
  const longitudCortejo = numero('longitud', { min: 0 });
  const velocidadMs = (numero('velocidad', { min: 0.1, max: 20 }) * 1000) / 3600;
  const acelerar = numero('acelerar', { min: 1, max: 1000 });
  const intervaloMs = numero('intervalo', { min: 2, max: 55 }) * 1000;
  const ruido = numero('ruido', { min: 0, max: 100 });
  const proporcionErroneos = numero('erroneos', { min: 0, max: 1 });
  const desde = numero('desde', { min: 0, max: 1 });

  // 1. Procesión y recorrido (GET públicos, como los ve el ciudadano).
  const { datos: procesion } = await api(`/procesiones/${op.procesion}`);
  if (!procesion.recorridoId) {
    salir(`"${procesion.nombre}" no tiene recorrido. Impórtale un GPX desde la app (Junta → Procesiones → editar).`);
  }
  const { datos: relaciones } = await api(`/recorridos/${procesion.recorridoId}/puntos-ruta`);
  const puntos = relaciones
    .filter((r) => r.puntoRuta?.latitud != null && r.puntoRuta?.longitud != null)
    .map((r) => ({ lat: r.puntoRuta.latitud, lon: r.puntoRuta.longitud }));
  if (puntos.length < 2) salir('El recorrido tiene menos de 2 puntos.');
  const ruta = prepararRuta(puntos);

  // 2. Entrar como cofrade, igual que la app (un solo JWT para todos los
  // cofrades virtuales: el backend no guarda quién manda cada ping).
  const { datos: sesion } = await api('/auth/codigo-acceso', { metodo: 'POST', cuerpo: { codigo: op.codigo } });
  if (!procesion.cofradiaIds.includes(sesion.usuarioId)) {
    salir(`El código es de la cofradía ${sesion.usuarioId}, que no participa en "${procesion.nombre}" (cofradías: ${procesion.cofradiaIds.join(', ')}).`);
  }

  // 3. Estado: hace falta EN_CURSO para que se acepten los pings.
  const tokenJunta = op.iniciar || op.finalizar ? await tokenDeJunta() : null;
  if (op.iniciar && procesion.estado !== 'EN_CURSO') {
    await cambiarEstado(procesion.id, 'EN_CURSO', tokenJunta);
    console.log('▶ Procesión puesta EN CURSO.');
  } else if (procesion.estado !== 'EN_CURSO') {
    salir(`"${procesion.nombre}" está ${procesion.estado}: ponla "En curso" desde la app (Junta → Procesiones → editar → Estado) o usa --iniciar.`);
  }

  const velocidadSimulada = velocidadMs * acelerar;
  const duracionRealMin = (ruta.total * (1 - desde) + longitudCortejo) / velocidadSimulada / 60;
  console.log(`
Procesión   ${procesion.nombre} (id ${procesion.id})
Recorrido   ${(ruta.total / 1000).toFixed(2)} km en ${puntos.length} puntos
Cortejo     ${numCofrades} cofrades en ${longitudCortejo} m · ${op.velocidad} km/h × ${acelerar}
Pings       cada ${intervaloMs / 1000} s · ruido GPS ~${ruido} m · ${porcentaje(proporcionErroneos)} erróneos
Duración    ~${duracionRealMin.toFixed(1)} min reales · Ctrl+C para parar
Mapa        abre la app → Mapa en Vivo
`);

  const totales = { guardados: 0, descartados: 0, erroneosEnviados: 0, erroneosGuardados: 0, fallos: 0 };
  let parar = false;
  process.on('SIGINT', () => {
    parar = true;
  });

  const inicio = Date.now();
  let ronda = 0;
  while (!parar) {
    ronda++;
    const segundosSimulados = ((Date.now() - inicio) / 1000) * acelerar;
    const cabeza = desde * ruta.total + velocidadMs * segundosSimulados;

    // Cofrade 0 en la cabeza, el último en la cola; hasta que la cola sale
    // del templo, los de detrás "esperan" en el punto de salida.
    const pings = Array.from({ length: numCofrades }, (_, i) => {
      const separacion = numCofrades > 1 ? (longitudCortejo * i) / (numCofrades - 1) : 0;
      const real = puntoADistancia(ruta, cabeza - separacion);
      const erroneo = Math.random() < proporcionErroneos;
      // Erróneo: lejos de cualquier tramo (el backend descarta los que pasan de 50 m).
      const posicion = erroneo ? posicionErronea(ruta, real) : desplazar(real, errorGps(ruido));
      return { erroneo, posicion };
    });

    const resultados = await Promise.all(
      pings.map(({ posicion }) =>
        api(`/procesiones/${procesion.id}/posiciones`, {
          metodo: 'POST',
          cuerpo: { latitud: posicion.lat, longitud: posicion.lon },
          token: sesion.token,
        }).then(
          (r) => ({ guardado: r.datos.guardado }),
          (err) => ({ error: err }),
        ),
      ),
    );

    let guardadosRonda = 0;
    let descartadosRonda = 0;
    for (let i = 0; i < resultados.length; i++) {
      const { guardado, error } = resultados[i];
      if (pings[i].erroneo) totales.erroneosEnviados++;
      if (error) {
        if (error.status === 410 || error.status === 401 || error.status === 403) {
          console.log(`\n■ El backend ha dejado de aceptar pings (${error.status}): ${error.message}`);
          parar = true;
          break;
        }
        totales.fallos++;
        continue;
      }
      if (guardado) {
        guardadosRonda++;
        if (pings[i].erroneo) totales.erroneosGuardados++;
      } else {
        descartadosRonda++;
      }
    }
    totales.guardados += guardadosRonda;
    totales.descartados += descartadosRonda;

    // Lo que ve el ciudadano en el mapa: la estela calculada por el backend.
    let estela = '';
    try {
      const { datos: e } = await api(`/procesiones/${procesion.id}/estela`);
      estela = `${barra(e.progresoCola, e.progresoCabeza)} cola ${porcentaje(e.progresoCola)} · cabeza ${porcentaje(e.progresoCabeza)} · ${e.cofradesActivos} activos`;
    } catch (err) {
      estela = `(sin estela: ${err.message})`;
    }
    console.log(`${hora()} ronda ${String(ronda).padStart(3)} · ✔ ${guardadosRonda} guardados · ✖ ${descartadosRonda} descartados · ${estela}`);

    const colaAlFinal = cabeza - longitudCortejo >= ruta.total;
    if (colaAlFinal) {
      console.log('\n■ La cola ha llegado al final del recorrido.');
      break;
    }
    if (!parar) await esperar(intervaloMs);
  }

  if (op.finalizar) {
    try {
      await cambiarEstado(procesion.id, 'FINALIZADO', tokenJunta);
      console.log('■ Procesión FINALIZADA.');
    } catch (err) {
      console.log(`No se ha podido finalizar: ${err.message}`);
    }
  }

  console.log(`
Resumen
  Pings guardados     ${totales.guardados}
  Pings descartados   ${totales.descartados}  (fuera del recorrido, RF-25)
  Erróneos enviados   ${totales.erroneosEnviados}, de ellos guardados ${totales.erroneosGuardados} (deberían ser 0)
  Errores de red/API  ${totales.fallos}
`);
}

// ---------------------------------------------------------------- inicio

if (op.ayuda) {
  console.log(AYUDA);
} else {
  (op.listar ? listar() : simular()).catch((err) => {
    console.error(`\n✖ ${err.message}\n`);
    process.exitCode = 1;
  });
}
