#!/usr/bin/env node
// Prueba en directo de VARIAS procesiones a la vez (RF-16, RF-18): salen
// escalonadas pero coinciden un rato en la calle, y el Mapa en Vivo debe
// mostrarlas todas, cada una con su estela.
//
// A diferencia de prueba-hoy.mjs, aquí no hay que preparar nada en la app:
// con la cuenta de Junta, el script
//   1. borra las procesiones de una ejecución anterior ("Prueba simultánea …"),
//   2. importa un GPX de recorridos_gpx/ por procesión y crea cada procesión
//      para hoy, con la cofradía de la procesión real de ese recorrido,
//   3. genera un código de acceso por cofradía,
//   4. espera a que el backend ponga cada una EN CURSO al llegar su hora
//      (aviso "Ha comenzado") y lanza un simulador por procesión,
//   5. al llegar la hora de fin, el backend las finaliza solas ("Ha finalizado").
//
// Uso (desde la raíz del repositorio):
//   node herramientas/simulador-procesion/prueba-varias.mjs \
//     --junta-email junta@ejemplo.es --junta-password 'Clave.123' [--hora 18:00]
//
// Por defecto: 3 procesiones que salen a la hora indicada, +3 y +6 minutos,
// y duran 10 minutos cada una (las tres coinciden de +6 a +10).

import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(DIR, '..', '..');

// Recorridos cortos del centro de Valladolid que comparten calles (Catedral,
// plaza de la Libertad, Angustias), para ver en el mapa estelas cercanas.
// cofradia = la de la procesión real de ese recorrido.
const PROCESIONES = [
  { gpx: '41_ofrecimiento-de-los-dolores-de-valladolid-a-la-santisima-vir.gpx', cofradia: 3, nombre: 'Ofrecimiento de los Dolores' },
  { gpx: '40_procesion-de-la-soledad.gpx', cofradia: 5, nombre: 'Soledad' },
  { gpx: '22_procesion-del-santisimo-cristo-de-la-luz.gpx', cofradia: 15, nombre: 'Cristo de la Luz' },
];
const PREFIJO = 'Prueba simultánea';
const VELOCIDAD_KMH = 1.5;

const { values: op } = parseArgs({
  options: {
    api: { type: 'string', default: process.env.SIMULADOR_API ?? 'http://virtual.lab.inf.uva.es:20102' },
    'junta-email': { type: 'string' },
    'junta-password': { type: 'string' },
    hora: { type: 'string' },
    desfase: { type: 'string', default: '0,3,6' },
    duracion: { type: 'string', default: '10' },
    cofrades: { type: 'string', default: '5' },
    borrar: { type: 'boolean', default: false },
    ayuda: { type: 'boolean', short: 'h', default: false },
  },
});

const AYUDA = `
Prueba de varias procesiones a la vez

  node prueba-varias.mjs --junta-email <email> --junta-password <clave> [opciones]

  --hora <HH:MM>       Salida de la primera (por defecto, el siguiente múltiplo de 5 min
                       con al menos 4 min de margen).
  --desfase <m,m,..>   Minutos de diferencia de cada salida respecto a la primera (0,3,6).
                       Con 2 valores se crean 2 procesiones. Ejemplo: --desfase 0,5,10
  --duracion <min>     Duración de cada procesión (10).
  --cofrades <n>       Cofrades virtuales por procesión (5).
  --borrar             Solo borra las procesiones de prueba de ejecuciones anteriores.
  --api <url>          Backend (servidor de la UVa).
`;

const API = op.api.replace(/\/+$/, '');
class ErrorPrueba extends Error {}
const fallar = (m) => {
  throw new ErrorPrueba(m);
};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const hhmm = (d) => d.toTimeString().slice(0, 5);
const hora = () => new Date().toTimeString().slice(0, 8);
const p2 = (n) => String(n).padStart(2, '0');
const localIso = (d) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:00`;

let token = null;

async function api(ruta, { metodo = 'GET', cuerpo, formulario } = {}) {
  let r;
  try {
    r = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: {
        ...(formulario ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formulario ?? (cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined),
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    fallar(`No se ha podido conectar con ${API} (${err.cause?.code ?? err.name}).`);
  }
  const texto = await r.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }
  if (!r.ok) fallar(datos?.mensaje ?? (datos ? JSON.stringify(datos) : `HTTP ${r.status} en ${metodo} ${ruta}`));
  return datos;
}

function distancia(puntos) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  let t = 0;
  for (let i = 1; i < puntos.length; i++) {
    const [a, b] = [puntos[i - 1], puntos[i]];
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
    t += 2 * R * Math.asin(Math.sqrt(h));
  }
  return t;
}

function cuerpo(p, cambios) {
  return {
    nombre: p.nombre, historia: p.historia, tradicion: p.tradicion, fecha: p.fecha,
    cofradiaIds: p.cofradiaIds, ubicacionId: p.ubicacionId, web: p.web,
    fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, recorridoId: p.recorridoId,
    pasosIds: null, estado: null, ...cambios,
  };
}

async function borrarAnteriores(ciudadId) {
  const anteriores = (await api(`/procesiones?ciudadId=${ciudadId}`)).filter((p) => p.nombre.startsWith(PREFIJO));
  for (const p of anteriores) {
    await api(`/procesiones/${p.id}`, { metodo: 'DELETE' }); // su recorrido se borra con ella
    console.log(`Borrada     ${p.nombre} (id ${p.id})`);
  }
}

// Un simulador por procesión, con su salida prefijada para distinguirlas.
function simular(n, procesion, codigo, acelerar) {
  const hijo = spawn(process.execPath, [
    path.join(DIR, 'simular-procesion.mjs'), '--api', API, '--procesion', String(procesion.id), '--codigo', codigo,
    '--cofrades', op.cofrades, '--longitud', '150', '--velocidad', String(VELOCIDAD_KMH),
    '--acelerar', String(acelerar), '--intervalo', '10', '--erroneos', '0.05',
  ]);
  const etiqueta = `[P${n}]`;
  for (const flujo of [hijo.stdout, hijo.stderr]) {
    let resto = '';
    flujo.on('data', (d) => {
      const lineas = (resto + d).split('\n');
      resto = lineas.pop();
      for (const l of lineas) if (l.trim()) console.log(`${etiqueta} ${l}`);
    });
  }
  return new Promise((r) => hijo.on('exit', r));
}

async function lanzar(n, procesion, codigo, inicio, fin, metros) {
  // Esperar a que el backend la ponga EN CURSO (o ponerla a mano al minuto).
  while (procesion.estado !== 'EN_CURSO') {
    if (new Date() - inicio > 60000) {
      console.log(`${hora()} [P${n}] el backend no la ha puesto en curso: la pongo a mano.`);
      procesion = await api(`/procesiones/${procesion.id}`, { metodo: 'PUT', cuerpo: cuerpo(procesion, { estado: 'EN_CURSO' }) });
      break;
    }
    await esperar(Math.min(10000, Math.max(2000, inicio - new Date())));
    procesion = await api(`/procesiones/${procesion.id}`);
  }
  console.log(`${hora()} [P${n}] ▶ EN CURSO · ${procesion.nombre}`);
  // Terminar el recorrido con un 10 % de margen antes de la hora de fin.
  const disponibleS = Math.max(60, (fin - new Date()) / 1000 - ((fin - inicio) / 1000) * 0.1);
  const acelerar = Math.max(1, Math.ceil(((metros + 150) / ((VELOCIDAD_KMH * 1000) / 3600) / disponibleS) * 10) / 10);
  await simular(n, procesion, codigo, acelerar);
  console.log(`${hora()} [P${n}] ■ simulación terminada; el backend la finalizará a las ${hhmm(fin)}.`);
}

async function main() {
  if (op.ayuda) return console.log(AYUDA);
  if (!op['junta-email'] || !op['junta-password']) fallar('Faltan --junta-email y --junta-password (cuenta de Junta de Valladolid).');
  const desfases = op.desfase.split(',').map(Number);
  if (desfases.length < 2 || desfases.length > PROCESIONES.length || desfases.some((d) => !(d >= 0))) {
    fallar(`--desfase debe tener entre 2 y ${PROCESIONES.length} valores, por ejemplo 0,3,6.`);
  }
  const duracion = Number(op.duracion);
  if (!(duracion >= 3)) fallar('--duracion debe ser de al menos 3 minutos.');

  const sesion = await api('/auth/login', { metodo: 'POST', cuerpo: { email: op['junta-email'], password: op['junta-password'] } });
  if (sesion.rol !== 'JUNTA') fallar(`Esa cuenta es de rol ${sesion.rol}, no de Junta.`);
  if (sesion.passwordProvisional) fallar('Esa cuenta aún tiene la contraseña provisional: cámbiala antes en la app.');
  token = sesion.token;
  const miembro = await api(`/miembros-junta/${sesion.usuarioId}`);
  const junta = await api(`/juntas-cofradias/${miembro.juntaCofradiasId}`);
  const ciudadId = junta.ciudadId;

  await borrarAnteriores(ciudadId);
  if (op.borrar) return;

  // Horario: la primera a --hora o al siguiente múltiplo de 5 minutos.
  const primera = new Date();
  if (op.hora) {
    const [hh, mm] = op.hora.split(':').map(Number);
    primera.setHours(hh, mm, 0, 0);
  } else {
    primera.setSeconds(0, 0);
    primera.setMinutes(Math.ceil((primera.getMinutes() + 4) / 5) * 5);
  }
  if (primera < new Date()) fallar(`Las ${op.hora} ya han pasado: usa una --hora posterior.`);

  // Crear cada procesión con su recorrido y un código para su cofradía.
  const plan = [];
  for (let i = 0; i < desfases.length; i++) {
    const def = PROCESIONES[i];
    const inicio = new Date(primera.getTime() + desfases[i] * 60000);
    const fin = new Date(inicio.getTime() + duracion * 60000);
    const contenido = await readFile(path.join(RAIZ, 'recorridos_gpx', def.gpx));
    const formulario = new FormData();
    formulario.append('archivo', new Blob([contenido], { type: 'application/gpx+xml' }), def.gpx);
    const recorrido = await api('/recorridos/importar-gpx', { metodo: 'POST', formulario });
    const procesion = await api('/procesiones', {
      metodo: 'POST',
      cuerpo: {
        nombre: `${PREFIJO} ${i + 1} · ${def.nombre}`, historia: null, tradicion: null, fecha: localIso(inicio),
        cofradiaIds: [def.cofradia], ubicacionId: null, web: null, fechaInicio: localIso(inicio), fechaFin: localIso(fin),
        recorridoId: recorrido.id, pasosIds: null, estado: null,
      },
    });
    const codigo = await api(`/cofradias/${def.cofradia}/codigos-acceso`, { metodo: 'POST' });
    const puntos = (await api(`/recorridos/${recorrido.id}/puntos-ruta`))
      .filter((r) => r.puntoRuta?.latitud != null)
      .map((r) => ({ lat: r.puntoRuta.latitud, lon: r.puntoRuta.longitud }));
    plan.push({ n: i + 1, procesion, codigo: codigo.codigo, inicio, fin, metros: distancia(puntos) });
    console.log(`Creada      P${i + 1} ${procesion.nombre} (id ${procesion.id}) · ${hhmm(inicio)}–${hhmm(fin)} · ` +
      `${(distancia(puntos) / 1000).toFixed(2)} km · código ${codigo.codigo}`);
  }
  const ultimaSalida = plan[plan.length - 1].inicio;
  const primerFin = plan[0].fin;
  console.log(primerFin > ultimaSalida
    ? `\nTodas en la calle a la vez de ${hhmm(ultimaSalida)} a ${hhmm(primerFin)}.`
    : '\nAviso: con este desfase y esta duración no llegan a coincidir todas a la vez.');

  console.log('\nAbre la app como ciudadano de Valladolid → Mapa en Vivo. Ctrl+C para parar.\n');
  process.on('SIGINT', () => {}); // Ctrl+C lo reciben los simuladores, que imprimen su resumen.
  await Promise.all(plan.map((p) => lanzar(p.n, p.procesion, p.codigo, p.inicio, p.fin, p.metros)));
  console.log(`\nFin de la prueba. Para borrar las procesiones de prueba: node herramientas/simulador-procesion/prueba-varias.mjs --borrar …\n`);
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}\n`);
  process.exitCode = 1;
});
