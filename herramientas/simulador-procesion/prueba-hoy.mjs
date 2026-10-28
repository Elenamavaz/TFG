#!/usr/bin/env node
// Prueba en directo de una procesión HOY (2026-10-26), con el servidor real.
//
// El formulario de la app solo deja elegir días de la Semana Santa, así que
// no se puede crear desde ahí una procesión para hoy. Este script:
//   1. Busca la procesión de prueba por su nombre (la creas antes en la app,
//      con su cofradía y un GPX importado).
//   2. La mueve a hoy a la hora indicada, con la duración indicada, y la deja
//      PROGRAMADA (PUT /procesiones/{id} con la cuenta de Junta).
//   3. Comprueba el código de acceso del cofrade antes de la hora.
//   4. Espera a que el backend la ponga EN CURSO solo al llegar la hora (con
//      su aviso push "Ha comenzado"); si al minuto no lo ha hecho, la pone
//      en curso a mano.
//   5. Lanza simular-procesion.mjs con una velocidad calculada para que el
//      cortejo termine el recorrido antes de la hora de fin. Al llegar esa
//      hora, el backend la finaliza solo (aviso "Ha finalizado").
//
// Uso (desde la raíz del repositorio):
//   node herramientas/simulador-procesion/prueba-hoy.mjs \
//     --junta-email junta@ejemplo.es --junta-password 'Clave.123' --codigo AB12CD34
//
// Solo preparar la procesión, sin esperar ni simular:
//   ... --solo-preparar

import { parseArgs } from 'node:util';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { values: op } = parseArgs({
  options: {
    api: { type: 'string', default: process.env.SIMULADOR_API ?? 'http://virtual.lab.inf.uva.es:20102' },
    'junta-email': { type: 'string' },
    'junta-password': { type: 'string' },
    codigo: { type: 'string' },
    nombre: { type: 'string', default: 'prueba' },
    hora: { type: 'string', default: '18:15' },
    duracion: { type: 'string', default: '10' },
    cofrades: { type: 'string', default: '6' },
    longitud: { type: 'string', default: '200' },
    erroneos: { type: 'string', default: '0.05' },
    'solo-preparar': { type: 'boolean', default: false },
    ayuda: { type: 'boolean', short: 'h', default: false },
  },
});

const AYUDA = `
Prueba en directo de una procesión hoy

  node prueba-hoy.mjs --junta-email <email> --junta-password <clave> --codigo <código cofrade> [opciones]

  --nombre <texto>     Parte del nombre de la procesión de prueba ("prueba").
  --hora <HH:MM>       Hora de salida, hoy (18:15).
  --duracion <min>     Duración en minutos; al acabar, el backend la finaliza (10).
  --cofrades <n>       Cofrades virtuales (6).
  --longitud <m>       Longitud del cortejo en metros (200).
  --erroneos <0-1>     Proporción de ubicaciones erróneas para probar el descarte (0.05).
  --api <url>          Backend (servidor de la UVa).
  --solo-preparar      Solo mueve la procesión a hoy y comprueba el código.
`;

const API = op.api.replace(/\/+$/, '');
const VELOCIDAD_KMH = 1.5;

class ErrorPrueba extends Error {}
const fallar = (m) => {
  throw new ErrorPrueba(m);
};
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const hora = (d = new Date()) => d.toTimeString().slice(0, 8);
const normal = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

async function api(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  let r;
  try {
    r = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch (err) {
    fallar(`No se ha podido conectar con ${API} (${err.cause?.code ?? err.name}). ¿Está arrancado el backend?`);
  }
  const texto = await r.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }
  if (!r.ok) {
    const e = new ErrorPrueba(datos?.mensaje ?? (datos ? JSON.stringify(datos) : `HTTP ${r.status}`));
    e.status = r.status;
    throw e;
  }
  return datos;
}

// LocalDateTime del backend, en hora local (la del servidor es la de España).
function localIso(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:00`;
}

function distanciaRecorrido(puntos) {
  const R = 6371000;
  const rad = (x) => (x * Math.PI) / 180;
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    const [a, b] = [puntos[i - 1], puntos[i]];
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
    total += 2 * R * Math.asin(Math.sqrt(h));
  }
  return total;
}

function cuerpo(p, cambios) {
  return {
    nombre: p.nombre, historia: p.historia, tradicion: p.tradicion, fecha: p.fecha,
    cofradiaIds: p.cofradiaIds, ubicacionId: p.ubicacionId, web: p.web,
    fechaInicio: p.fechaInicio, fechaFin: p.fechaFin, recorridoId: p.recorridoId,
    pasosIds: null, estado: null, ...cambios,
  };
}

async function main() {
  if (op.ayuda) return console.log(AYUDA);
  if (!op['junta-email'] || !op['junta-password']) fallar('Faltan --junta-email y --junta-password (cuenta de Junta de la ciudad).');
  if (!op.codigo) fallar('Falta --codigo (genéralo HOY en la app: Junta → Cofradías → Códigos de acceso; caduca a las 24 h).');
  const [hh, mm] = op.hora.split(':').map(Number);
  const duracion = Number(op.duracion);
  if (!(hh >= 0 && hh < 24 && mm >= 0 && mm < 60)) fallar(`--hora no válida: ${op.hora}`);
  if (!(duracion >= 5)) fallar('--duracion debe ser de al menos 5 minutos.');

  // 1. Cuenta de Junta.
  const sesion = await api('/auth/login', { metodo: 'POST', cuerpo: { email: op['junta-email'], password: op['junta-password'] } });
  if (sesion.rol !== 'JUNTA') fallar(`Esa cuenta es de rol ${sesion.rol}, no de Junta.`);
  if (sesion.passwordProvisional) fallar('Esa cuenta aún tiene la contraseña provisional: entra antes en la app y cámbiala.');
  const token = sesion.token;

  // 2. La procesión de prueba, por nombre, en cualquier ciudad.
  const ciudades = await api('/ciudades');
  const encontradas = [];
  for (const c of ciudades) {
    for (const p of await api(`/procesiones?ciudadId=${c.id}`)) {
      if (normal(p.nombre).includes(normal(op.nombre))) encontradas.push({ ...p, ciudad: c.nombre });
    }
  }
  if (encontradas.length === 0) fallar(`No hay ninguna procesión cuyo nombre contenga "${op.nombre}". Créala antes en la app.`);
  if (encontradas.length > 1) {
    fallar(`Hay ${encontradas.length} procesiones con "${op.nombre}" en el nombre; afina con --nombre:\n` +
      encontradas.map((p) => `   ${p.id}  ${p.nombre} (${p.ciudad})`).join('\n'));
  }
  let procesion = await api(`/procesiones/${encontradas[0].id}`);
  console.log(`\nProcesión   ${procesion.nombre} (id ${procesion.id}, ${encontradas[0].ciudad})`);

  // 3. Recorrido con coordenadas (si el servidor no las da, está desactualizado).
  if (!procesion.recorridoId) fallar('No tiene recorrido: impórtale un GPX desde la app (Junta → Procesiones → editar → Importar GPX).');
  const relaciones = await api(`/recorridos/${procesion.recorridoId}/puntos-ruta`);
  const puntos = relaciones
    .filter((r) => r.puntoRuta?.latitud != null)
    .map((r) => ({ lat: r.puntoRuta.latitud, lon: r.puntoRuta.longitud }));
  if (puntos.length < 2) {
    fallar('El servidor no devuelve las coordenadas del recorrido: está desactualizado. ' +
      'En el servidor: cd ~/TFG && git pull && cd backend && ./mvnw package -DskipTests && sudo systemctl restart semanasanta');
  }
  const metros = distanciaRecorrido(puntos);
  console.log(`Recorrido   ${(metros / 1000).toFixed(2)} km en ${puntos.length} puntos`);

  // 4. Código del cofrade (antes de la hora, para no descubrir el fallo en directo).
  const cofrade = await api('/auth/codigo-acceso', { metodo: 'POST', cuerpo: { codigo: op.codigo } });
  if (!procesion.cofradiaIds.includes(cofrade.usuarioId)) {
    fallar(`El código es de la cofradía ${cofrade.usuarioId}, que no participa en la procesión (cofradías: ${procesion.cofradiaIds.join(', ')}).`);
  }
  console.log('Código      válido para una cofradía de la procesión');

  // 5. Moverla a hoy.
  const inicio = new Date();
  inicio.setHours(hh, mm, 0, 0);
  const fin = new Date(inicio.getTime() + duracion * 60000);
  const ahora = new Date();
  if (ahora >= fin) fallar(`Las ${op.hora} + ${duracion} min ya han pasado. Usa otra --hora.`);
  // PROGRAMADO si aún no es la hora; si ya lo es, EN_CURSO directamente.
  const estado = ahora < inicio ? 'PROGRAMADO' : 'EN_CURSO';
  procesion = await api(`/procesiones/${procesion.id}`, {
    metodo: 'PUT',
    token,
    cuerpo: cuerpo(procesion, { fecha: localIso(inicio), fechaInicio: localIso(inicio), fechaFin: localIso(fin), estado }),
  });
  console.log(`Horario     hoy de ${hora(inicio).slice(0, 5)} a ${hora(fin).slice(0, 5)} · estado ${procesion.estado}`);
  // La estela guarda el máximo avance y nunca retrocede (404 = aún no hay).
  const estelaPrevia = await api(`/procesiones/${procesion.id}/estela`).catch(() => null);
  if (estelaPrevia && estelaPrevia.progresoCabeza > 0) {
    console.log('Aviso       esta procesión ya se simuló antes: la estela no retrocede, así que empezará donde se quedó.\n' +
      '            Para empezar de cero, crea una procesión nueva.');
  }

  if (op['solo-preparar']) {
    console.log('\nPreparada. Vuelve a lanzar el script sin --solo-preparar antes de la hora.\n');
    return;
  }

  // 6. Esperar a que el backend la ponga EN CURSO al llegar la hora.
  console.log('\nAbre la app (ciudadano en esa ciudad) → Mapa en Vivo. Al empezar debería llegar el aviso "Ha comenzado".');
  while (procesion.estado !== 'EN_CURSO') {
    const falta = Math.round((inicio - new Date()) / 1000);
    if (falta < -60) {
      console.log(`${hora()} El backend no la ha puesto en curso sola: la pongo en curso a mano.`);
      procesion = await api(`/procesiones/${procesion.id}`, { metodo: 'PUT', token, cuerpo: cuerpo(procesion, { estado: 'EN_CURSO' }) });
      break;
    }
    process.stdout.write(`\r${hora()} esperando la salida (${falta > 0 ? `faltan ${Math.floor(falta / 60)} min ${falta % 60} s` : 'ya es la hora, esperando al backend'})...      `);
    await esperar(Math.min(15000, Math.max(3000, falta * 1000)));
    procesion = await api(`/procesiones/${procesion.id}`);
  }
  console.log(`\n${hora()} ▶ Procesión EN CURSO.`);

  // 7. Velocidad para terminar antes de la hora de fin, con un margen del
  // 20 % de la duración (2 minutos en una procesión de 10).
  const disponibleS = (fin - new Date()) / 1000 - duracion * 60 * 0.2;
  const longitud = Number(op.longitud);
  const necesarioS = (metros + longitud) / ((VELOCIDAD_KMH * 1000) / 3600);
  const acelerar = Math.max(1, Math.ceil((necesarioS / Math.max(60, disponibleS)) * 10) / 10);
  console.log(`Simulación  ${op.cofrades} cofrades a ${VELOCIDAD_KMH} km/h × ${acelerar} → el cortejo termina antes de las ${hora(fin).slice(0, 5)}\n`);

  // 8. El simulador de siempre, con esos parámetros (Ctrl+C para pararlo).
  const simulador = path.join(path.dirname(fileURLToPath(import.meta.url)), 'simular-procesion.mjs');
  const hijo = spawn(process.execPath, [
    simulador, '--api', API, '--procesion', String(procesion.id), '--codigo', op.codigo,
    '--cofrades', op.cofrades, '--longitud', op.longitud, '--velocidad', String(VELOCIDAD_KMH),
    '--acelerar', String(acelerar), '--intervalo', '10', '--erroneos', op.erroneos,
  ], { stdio: 'inherit' });
  process.on('SIGINT', () => {}); // Ctrl+C lo recibe el simulador, que imprime su resumen.
  const codigo = await new Promise((r) => hijo.on('exit', r));
  console.log(`A las ${hora(fin).slice(0, 5)} el backend finalizará la procesión solo (aviso "Ha finalizado").\n`);
  process.exitCode = codigo ?? 0;
}

main().catch((err) => {
  console.error(`\n✖ ${err.message}\n`);
  process.exitCode = 1;
});
