// Días de la Semana Santa CALCULADOS (bug 13 de bugs.md, 2026-10-19): antes
// salían de una tabla fija de 2027 (mock/diasSemanaSanta.js) y la app solo
// servía para ese año. Domingo de Resurrección por el algoritmo anónimo
// gregoriano (Meeus/Jones/Butcher); el resto se cuenta desde él.
// Viernes de Dolores y Sábado de Pasión (2026-10-19): en Valladolid la
// Semana Santa empieza ya el Viernes de Dolores (programa oficial de la
// Junta de Cofradías), y sin ellos sus procesiones no salían en ningún día.
const DIAS = [
  { id: 'viernes-dolores', nombre: 'Viernes de Dolores', desdePascua: -9 },
  { id: 'sabado-pasion', nombre: 'Sábado de Pasión', desdePascua: -8 },
  { id: 'domingo-ramos', nombre: 'Domingo de Ramos', desdePascua: -7 },
  { id: 'lunes-santo', nombre: 'Lunes Santo', desdePascua: -6 },
  { id: 'martes-santo', nombre: 'Martes Santo', desdePascua: -5 },
  { id: 'miercoles-santo', nombre: 'Miércoles Santo', desdePascua: -4 },
  { id: 'jueves-santo', nombre: 'Jueves Santo', desdePascua: -3 },
  { id: 'viernes-santo', nombre: 'Viernes Santo', desdePascua: -2 },
  { id: 'sabado-santo', nombre: 'Sábado Santo', desdePascua: -1 },
  { id: 'domingo-resurreccion', nombre: 'Domingo de Resurrección', desdePascua: 0 },
];

function pad2(numero) {
  return String(numero).padStart(2, '0');
}

function fechaLocalISO(fecha) {
  return `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;
}

export function domingoDeResurreccion(anio) {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31); // 3 = marzo, 4 = abril
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(anio, mes - 1, dia);
}

// [{ id, nombre, fecha: 'YYYY-MM-DD' }] de la Semana Santa de ese año.
export function diasSemanaSantaDe(anio) {
  const pascua = domingoDeResurreccion(anio);
  return DIAS.map(({ id, nombre, desdePascua }) => ({
    id,
    nombre,
    fecha: fechaLocalISO(new Date(pascua.getFullYear(), pascua.getMonth(), pascua.getDate() + desdePascua)),
  }));
}

// La Semana Santa "en vigor": la de este año si aún no ha terminado (hasta
// el Domingo de Resurrección incluido), y si no, la del año siguiente. P.ej.
// el 19/10/2026 -> la de 2027.
export function anioSemanaSantaVigente(hoy = new Date()) {
  const anio = hoy.getFullYear();
  const pascua = domingoDeResurreccion(anio);
  const finDePascua = new Date(pascua.getFullYear(), pascua.getMonth(), pascua.getDate() + 1);
  return hoy < finDePascua ? anio : anio + 1;
}

// El backend guarda un único LocalDateTime (p.ej. "2027-03-21T21:00:00"),
// pero las pantallas ya existentes (HomeScreen, CalenderScreen...) esperan
// fecha/dia/hora sueltos, como en el mock/diseño original -ver decisión del
// 2026-08-15 en la memoria del TFG. Esta función hace de puente: separa
// fecha (YYYY-MM-DD) y hora (HH:mm), y resuelve el nombre del día de Semana
// Santa buscando esa fecha entre los días de la Semana Santa de su año
// (diasSemanaSantaDe) -no hace falta que "día" exista como tal en el
// backend, es calendario, no datos de usuario.
export function partirFechaHora(fechaIso) {
  if (!fechaIso) return { fecha: null, hora: null, dia: null };
  const [fecha, horaCompleta] = fechaIso.split('T');
  const hora = horaCompleta ? horaCompleta.slice(0, 5) : null;
  const diaSemanaSanta = diasSemanaSantaDe(Number(fecha.slice(0, 4))).find((d) => d.fecha === fecha);
  return { fecha, hora, dia: diaSemanaSanta?.nombre ?? null };
}

// Duración en minutos entre dos LocalDateTime ISO del backend (Procesion.fechaInicio/fechaFin).
// null si falta cualquiera de las dos -no toda procesión tiene ambas fijadas todavía.
export function minutosEntre(fechaInicioIso, fechaFinIso) {
  if (!fechaInicioIso || !fechaFinIso) return null;
  const inicio = new Date(fechaInicioIso);
  const fin = new Date(fechaFinIso);
  return Math.round((fin - inicio) / 60000);
}

// Camino inverso a partirFechaHora: para FormularioProcesionScreen, que pide
// un día de Semana Santa (de diasSemanaSantaDe, ver getDiasSemanaSanta) y una
// hora de salida sueltos, no un LocalDateTime -esto los junta en el formato
// que sí entiende el backend ("2027-03-21T21:00:00").
// Hora de salida tecleada a mano en los formularios de la Junta: "HH:MM" con
// dos dígitos, que es lo que combinarFechaHora puede pegar tal cual.
export function esHoraValida(hora) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test((hora ?? '').trim());
}

export function combinarFechaHora(fechaDia, hora) {
  if (!fechaDia || !hora) return null;
  return `${fechaDia}T${hora}:00`;
}

// Inversa de minutosEntre: fechaFin = fechaInicio + duración (en minutos).
// null si falta la fecha de inicio o no hay duración -una procesión puede
// programarse sin duración estimada todavía.
export function sumarMinutos(fechaInicioIso, minutos) {
  if (!fechaInicioIso || !minutos) return null;
  const inicio = new Date(fechaInicioIso);
  const fin = new Date(inicio.getTime() + minutos * 60000);
  // toISOString() da "...Z" en UTC: se recorta a los primeros 19 caracteres
  // ("YYYY-MM-DDTHH:mm:ss") para no mandar el desfase horario -mismo
  // formato "hora local sin zona" que ya usa combinarFechaHora.
  const pad = (n) => String(n).padStart(2, '0');
  return `${fin.getFullYear()}-${pad(fin.getMonth() + 1)}-${pad(fin.getDate())}T${pad(fin.getHours())}:${pad(fin.getMinutes())}:00`;
}

// "Xh Ymin" <-> minutos totales, formato del campo "Duración" del mockup.
export function formatearDuracionCorta(minutos) {
  if (!minutos && minutos !== 0) return '0h 0min';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return `${horas}h ${resto}min`;
}

export function parsearDuracionCorta(texto) {
  const coincide = /^(\d+)h\s*(\d+)?min?$/.exec(texto.trim());
  if (!coincide) return 0;
  const horas = Number(coincide[1] ?? 0);
  const minutos = Number(coincide[2] ?? 0);
  return horas * 60 + minutos;
}
