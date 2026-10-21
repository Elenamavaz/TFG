#!/usr/bin/env node
// Carga la Semana Santa de Valladolid (semana-santa-valladolid.json) en el
// backend a través de su API, como lo haría la Junta desde la app: mismas
// validaciones y permisos, sin tocar la base de datos directamente ni
// reiniciar el servidor.
//
// - Se puede repetir sin duplicar: cada cofradía, paso, ubicación, procesión
//   y evento se busca primero por nombre y solo se crea si no existe.
// - Lo que ya existe no se modifica, salvo con --actualizar (y aun así se
//   conservan imagen, estado activo, recorrido y estado de la procesión).
// - Los actos se colocan en los mismos días de la Semana Santa del año que se
//   cargue (por defecto, la próxima): el programa de referencia es el de 2026.
// - Al final avisa de lo que hay en la base de datos y no está en el fichero
//   (p.ej. datos de prueba o del DataSeeder), sin borrarlo.
//
// Sin dependencias: Node 18 o superior.
//   node herramientas/datos-valladolid/cargar-datos.mjs --ayuda

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const AYUDA = `
Carga de datos · Semana Santa de Valladolid

Uso:
  node cargar-datos.mjs --junta-email <email> --junta-password <contraseña> [opciones]

Obligatorias (cuenta de un miembro de la Junta de Cofradías de Valladolid):
  --junta-email <email>
  --junta-password <contraseña>

Opciones:
  --simular            Muestra lo que haría sin crear ni modificar nada.
  --actualizar         Actualiza también lo que ya existe (textos, fechas, pasos),
                       conservando imágenes, estado activo, recorridos y estado.
  --anio <año>         Semana Santa en la que colocar los actos (por defecto, la
                       próxima: la de este año si no ha terminado, si no la siguiente).
  --api <url>          Backend (http://localhost:8080, o la variable CARGA_API).
  --datos <fichero>    Fichero de datos (semana-santa-valladolid.json, junto a este script).
  --ayuda              Esta ayuda.

Ejemplos:
  node cargar-datos.mjs --junta-email junta@ejemplo.es --junta-password '...' --simular
  node cargar-datos.mjs --junta-email junta@ejemplo.es --junta-password '...'
  node cargar-datos.mjs --api http://virtual.lab.inf.uva.es:20102 --junta-email ... --junta-password ...
`;

const { values: op } = parseArgs({
  options: {
    'junta-email': { type: 'string' },
    'junta-password': { type: 'string' },
    simular: { type: 'boolean', default: false },
    actualizar: { type: 'boolean', default: false },
    anio: { type: 'string' },
    api: { type: 'string', default: process.env.CARGA_API ?? 'http://localhost:8080' },
    datos: { type: 'string', default: join(dirname(fileURLToPath(import.meta.url)), 'semana-santa-valladolid.json') },
    ayuda: { type: 'boolean', short: 'h', default: false },
  },
});

const API = op.api.replace(/\/+$/, '');

class ErrorCarga extends Error {}
const salir = (mensaje) => {
  throw new ErrorCarga(mensaje);
};

// ---------------------------------------------------------------- API

let token = null;

async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  let respuesta;
  try {
    respuesta = await fetch(`${API}${ruta}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      signal: AbortSignal.timeout(20000),
    });
  } catch (err) {
    salir(`No se ha podido conectar con ${API} (${err.cause?.code ?? err.name}). ¿Está arrancado el backend?`);
  }
  const texto = await respuesta.text();
  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }
  if (!respuesta.ok) {
    const detalle = datos?.mensaje ?? (datos ? JSON.stringify(datos) : `HTTP ${respuesta.status}`);
    const error = new Error(`${metodo} ${ruta} → ${respuesta.status}: ${detalle}`);
    error.status = respuesta.status;
    throw error;
  }
  return datos;
}

// ---------------------------------------------------------------- fechas

// Mismo cálculo que la app (data/utils/fechaSemanaSanta.js): Domingo de
// Resurrección por el algoritmo anónimo gregoriano.
function domingoDeResurreccion(anio) {
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(anio, mes - 1, dia));
}

function anioSemanaSantaVigente(hoy = new Date()) {
  const anio = hoy.getFullYear();
  const pascua = domingoDeResurreccion(anio);
  const finDePascua = new Date(pascua.getTime() + 24 * 3600 * 1000);
  return hoy < finDePascua ? anio : anio + 1;
}

const DESDE_PASCUA = {
  'viernes-dolores': -9, 'sabado-pasion': -8, 'domingo-ramos': -7, 'lunes-santo': -6, 'martes-santo': -5,
  'miercoles-santo': -4, 'jueves-santo': -3, 'viernes-santo': -2, 'sabado-santo': -1, 'domingo-resurreccion': 0,
};

const pad2 = (n) => String(n).padStart(2, '0');

// LocalDateTime del backend ("2027-03-25T18:00:00"), sin zona: hora de España.
function fechaDe(acto, anio, minutosExtra = 0) {
  const desde = acto.desdePascua ?? DESDE_PASCUA[acto.dia];
  if (desde === undefined) salir(`"${acto.nombre}": día desconocido "${acto.dia}".`);
  const [hh, mm] = acto.hora.split(':').map(Number);
  const pascua = domingoDeResurreccion(anio);
  const t = new Date(pascua.getTime() + desde * 86400000 + (hh * 60 + mm + minutosExtra) * 60000);
  return `${t.getUTCFullYear()}-${pad2(t.getUTCMonth() + 1)}-${pad2(t.getUTCDate())}T${pad2(t.getUTCHours())}:${pad2(t.getUTCMinutes())}:00`;
}

// ---------------------------------------------------------------- utilidades

// Comparación de nombres sin mayúsculas, tildes ni espacios de más.
const normalizar = (texto) =>
  (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

function buscarPorNombre(lista, nombre, alias = []) {
  const buscados = [nombre, ...alias].map(normalizar);
  return lista.find((x) => buscados.includes(normalizar(x.nombre)));
}

const cuenta = { creados: 0, actualizados: 0, sinCambios: 0 };

async function crearOActualizar({ tipo, nombre, existente, crear, actualizar }) {
  if (!existente) {
    console.log(`  + ${tipo}: ${nombre}`);
    cuenta.creados++;
    return op.simular ? { id: `(nuevo) ${nombre}` } : crear();
  }
  if (op.actualizar) {
    console.log(`  ~ ${tipo}: ${nombre}`);
    cuenta.actualizados++;
    return op.simular ? existente : actualizar(existente);
  }
  cuenta.sinCambios++;
  return existente;
}

// ---------------------------------------------------------------- carga

async function cargar() {
  const email = op['junta-email'];
  const password = op['junta-password'];
  if (!email || !password) salir('Faltan --junta-email y --junta-password (cuenta de un miembro de la Junta de Valladolid).');

  const datos = JSON.parse(readFileSync(op.datos, 'utf-8'));
  const anio = op.anio ? Number(op.anio) : anioSemanaSantaVigente();
  if (!Number.isInteger(anio) || anio < 2000 || anio > 2100) salir(`--anio no es válido: "${op.anio}"`);

  // 0. Regla de la app (RF-30): un paso pertenece a una sola cofradía y solo
  // puede salir en procesiones/eventos en los que participa esa cofradía -la
  // pantalla "Pasos de la procesión" solo ofrece los de sus cofradías, así
  // que un paso de otra no se podría ni ver ni quitar. Se comprueba antes de
  // escribir nada.
  const incoherentes = [...datos.procesiones, ...datos.eventos].flatMap((acto) =>
    acto.cofradias === 'todas'
      ? []
      : (acto.pasos ?? [])
          .filter((clave) => !acto.cofradias.includes(clave.split('/')[0]))
          .map((clave) => `"${acto.nombre}": el paso ${clave} es de una cofradía que no participa`),
  );
  if (incoherentes.length > 0) salir(`Datos incoherentes:\n  ${incoherentes.join('\n  ')}`);

  // 1. Sesión de Junta y su ciudad.
  const sesion = await api('/auth/login', { metodo: 'POST', cuerpo: { email, password } });
  if (sesion.rol !== 'JUNTA') salir(`La cuenta ${email} es de rol ${sesion.rol}, no de Junta.`);
  if (sesion.activo === false) salir('La cuenta de Junta está desactivada.');
  token = sesion.token;
  const miembro = await api(`/miembros-junta/${sesion.usuarioId}`);
  const junta = await api(`/juntas-cofradias/${miembro.juntaCofradiasId}`);
  const ciudad = await api(`/ciudades/${junta.ciudadId}`);
  if (normalizar(ciudad.nombre) !== normalizar(datos.ciudad)) {
    salir(`La Junta de ${email} gestiona "${ciudad.nombre}", no "${datos.ciudad}".`);
  }

  const pascua = domingoDeResurreccion(anio);
  console.log(`
Ciudad      ${ciudad.nombre} (id ${ciudad.id})
Semana Santa ${anio} · Domingo de Resurrección ${pad2(pascua.getUTCDate())}/${pad2(pascua.getUTCMonth() + 1)}/${anio}
Programa    referencia ${datos.programaReferencia}
Modo        ${op.simular ? 'SIMULACIÓN (no se escribe nada)' : 'carga real'}${op.actualizar ? ' · actualizando lo existente' : ''}
`);
  if (anio < anioSemanaSantaVigente()) {
    console.log(`⚠ La Semana Santa de ${anio} ya ha pasado: el backend pondrá FINALIZADOS todos los actos al minuto siguiente.\n`);
  }

  // 1b. Historia y patrimonio de la ciudad (lo que la Junta puede editar,
  // PUT /ciudades/{id}/informacion). Mismo criterio que el resto: si la
  // ciudad ya tiene texto propio no se pisa, salvo con --actualizar.
  if (datos.informacionCiudad) {
    console.log('Ciudad');
    const { historia, patrimonio } = datos.informacionCiudad;
    const tieneTexto = Boolean(ciudad.historia?.trim() || ciudad.patrimonio?.trim());
    const yaIgual = ciudad.historia === historia && ciudad.patrimonio === patrimonio;
    if (yaIgual || (tieneTexto && !op.actualizar)) {
      cuenta.sinCambios++;
      if (!yaIgual) console.log('  = historia y patrimonio: la ciudad ya tiene texto (usa --actualizar para reescribirlo)');
    } else {
      console.log(`  ${tieneTexto ? '~' : '+'} historia y patrimonio de ${ciudad.nombre}`);
      cuenta[tieneTexto ? 'actualizados' : 'creados']++;
      if (!op.simular) {
        await api(`/ciudades/${ciudad.id}/informacion`, { metodo: 'PUT', cuerpo: { historia, patrimonio } });
      }
    }
  }

  // 2. Cofradías.
  console.log('Cofradías');
  const cofradiasExistentes = await api(`/cofradias?ciudadId=${ciudad.id}&incluirInactivas=true`);
  const idCofradia = {};
  for (const c of datos.cofradias) {
    const existente = buscarPorNombre(cofradiasExistentes, c.nombre, c.alias);
    const cuerpo = (base = {}) => ({
      nombre: c.nombre, historia: c.historia, web: c.web ?? base.web ?? null,
      imagen: base.imagen ?? null, ciudadId: ciudad.id, activa: base.activa ?? true,
    });
    const r = await crearOActualizar({
      tipo: 'cofradía', nombre: c.nombre, existente,
      crear: () => api('/cofradias', { metodo: 'POST', cuerpo: cuerpo() }),
      actualizar: (e) => api(`/cofradias/${e.id}`, { metodo: 'PUT', cuerpo: cuerpo(e) }),
    });
    idCofradia[c.clave] = r.id;
  }

  // 3. Pasos de cada cofradía.
  console.log('Pasos');
  const idPaso = {};
  const pasosSobrantes = [];
  for (const c of datos.cofradias) {
    const existentes = existenteId(idCofradia[c.clave]) ? await api(`/pasos?cofradiaId=${idCofradia[c.clave]}`) : [];
    existentes
      .filter((x) => !buscarPorNombreEnDatos(c.pasos, x.nombre))
      .forEach((x) => pasosSobrantes.push(`paso "${x.nombre}" de ${c.nombre} (id ${x.id})`));
    for (const p of c.pasos) {
      const existente = buscarPorNombre(existentes, p.nombre, p.alias);
      const cuerpo = (base = {}) => ({
        nombre: p.nombre, historia: p.historia, analisisArtistico: p.analisisArtistico,
        imagen: base.imagen ?? null, cofradiaId: idCofradia[c.clave],
      });
      const r = await crearOActualizar({
        tipo: 'paso', nombre: `${p.nombre} (${c.clave})`, existente,
        crear: () => api('/pasos', { metodo: 'POST', cuerpo: cuerpo() }),
        actualizar: (e) => api(`/pasos/${e.id}`, { metodo: 'PUT', cuerpo: cuerpo(e) }),
      });
      idPaso[`${c.clave}/${p.clave}`] = r.id;
    }
  }

  // 4. Ubicaciones (templos de salida y lugares de los eventos), por dirección.
  console.log('Ubicaciones');
  const ubicacionesExistentes = await api('/ubicaciones');
  const idLugar = {};
  const lugaresUsados = new Set([
    ...datos.procesiones.map((a) => a.salida).filter(Boolean),
    ...datos.eventos.map((a) => a.lugar),
  ]);
  for (const clave of lugaresUsados) {
    const l = datos.lugares[clave];
    if (!l) salir(`Lugar "${clave}" no definido en el fichero.`);
    const existente = ubicacionesExistentes.find((u) => normalizar(u.direccion) === normalizar(l.direccion));
    if (existente) {
      idLugar[clave] = existente.id;
      cuenta.sinCambios++;
      continue;
    }
    console.log(`  + ubicación: ${l.direccion}`);
    cuenta.creados++;
    idLugar[clave] = op.simular
      ? `(nueva) ${clave}`
      : (await api('/ubicaciones', { metodo: 'POST', cuerpo: { latitud: l.latitud, longitud: l.longitud, direccion: l.direccion } })).id;
  }

  const todas = Object.values(idCofradia);
  const cofradiasDe = (acto) => (acto.cofradias === 'todas' ? todas : acto.cofradias.map((k) => idCofradia[k]));
  const pasosDe = (acto) => (acto.pasos ?? []).map((k) => idPaso[k]);

  // 5. Eventos.
  console.log('Eventos');
  const eventosExistentes = await api(`/eventos?ciudadId=${ciudad.id}`);
  for (const e of datos.eventos) {
    const fecha = fechaDe(e, anio);
    const cuerpo = (base = {}) => ({
      nombre: e.nombre, historia: e.historia ?? null, tradicion: e.tradicion ?? null, fecha,
      cofradiaIds: cofradiasDe(e), ubicacionId: idLugar[e.lugar], web: e.web ?? base.web ?? null,
      pasosIds: pasosDe(e), fechaFin: e.duracionMin ? fechaDe(e, anio, e.duracionMin) : null, estado: null,
    });
    await crearOActualizar({
      tipo: 'evento', nombre: `${e.nombre} · ${fecha.replace('T', ' ').slice(0, 16)}`,
      existente: buscarPorNombre(eventosExistentes, e.nombre, e.alias),
      crear: () => api('/eventos', { metodo: 'POST', cuerpo: cuerpo() }),
      actualizar: (x) => api(`/eventos/${x.id}`, { metodo: 'PUT', cuerpo: cuerpo(x) }),
    });
  }

  // 6. Procesiones.
  console.log('Procesiones');
  const procesionesExistentes = await api(`/procesiones?ciudadId=${ciudad.id}`);
  for (const p of datos.procesiones) {
    const inicio = fechaDe(p, anio);
    const cuerpo = (base = {}) => ({
      nombre: p.nombre, historia: p.historia ?? null, tradicion: p.tradicion ?? null, fecha: inicio,
      cofradiaIds: cofradiasDe(p), ubicacionId: p.salida ? idLugar[p.salida] : null, web: p.web ?? base.web ?? null,
      fechaInicio: inicio, fechaFin: p.duracionMin ? fechaDe(p, anio, p.duracionMin) : null,
      recorridoId: base.recorridoId ?? null, // un recorrido ya importado se conserva
      pasosIds: pasosDe(p),
      estado: null, // no cambiar el estado de una procesión existente
    });
    await crearOActualizar({
      tipo: 'procesión', nombre: `${p.nombre} · ${inicio.replace('T', ' ').slice(0, 16)}`,
      existente: buscarPorNombre(procesionesExistentes, p.nombre, p.alias),
      crear: () => api('/procesiones', { metodo: 'POST', cuerpo: cuerpo() }),
      actualizar: (x) => api(`/procesiones/${x.id}`, { metodo: 'PUT', cuerpo: cuerpo(x) }),
    });
  }

  // 7. Lo que hay en la base de datos y no está en el fichero (no se borra).
  const sobrantes = [
    ...cofradiasExistentes.filter((x) => !buscarPorNombreEnDatos(datos.cofradias, x.nombre)).map((x) => `cofradía "${x.nombre}" (id ${x.id})`),
    ...pasosSobrantes,
    ...eventosExistentes.filter((x) => !buscarPorNombreEnDatos(datos.eventos, x.nombre)).map((x) => `evento "${x.nombre}" (id ${x.id})`),
    ...procesionesExistentes.filter((x) => !buscarPorNombreEnDatos(datos.procesiones, x.nombre)).map((x) => `procesión "${x.nombre}" (id ${x.id})`),
  ];

  console.log(`
Resumen${op.simular ? ' (simulación)' : ''}
  Creados          ${cuenta.creados}
  Actualizados     ${cuenta.actualizados}
  Ya existían      ${cuenta.sinCambios}${op.actualizar ? '' : ' (sin modificar; usa --actualizar para reescribirlos)'}`);
  if (sobrantes.length > 0) {
    console.log(`
⚠ En la base de datos hay ${sobrantes.length} elementos de ${ciudad.nombre} que no están en el fichero
  (datos de prueba, del DataSeeder o creados a mano). No se han tocado; revísalos desde la app:`);
    sobrantes.forEach((s) => console.log(`  · ${s}`));
  }
  console.log('');
}

function existenteId(id) {
  return typeof id === 'number';
}

function buscarPorNombreEnDatos(lista, nombre) {
  return lista.some((x) => [x.nombre, ...(x.alias ?? [])].map(normalizar).includes(normalizar(nombre)));
}

if (op.ayuda) {
  console.log(AYUDA);
} else {
  cargar().catch((err) => {
    console.error(`\n✖ ${err.message}\n`);
    process.exitCode = 1;
  });
}
