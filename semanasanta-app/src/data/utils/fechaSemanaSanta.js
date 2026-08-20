import { diasSemanaSantaMock } from '../mock/diasSemanaSanta';

// El backend guarda un único LocalDateTime (p.ej. "2027-03-21T21:00:00"),
// pero las pantallas ya existentes (HomeScreen, CalenderScreen...) esperan
// fecha/dia/hora sueltos, como en el mock/diseño original -ver decisión del
// 2026-08-15 en la memoria del TFG. Esta función hace de puente: separa
// fecha (YYYY-MM-DD) y hora (HH:mm), y resuelve el nombre del día de Semana
// Santa buscando esa fecha en la tabla fija por año (diasSemanaSantaMock) -no
// hace falta que "día" exista como tal en el backend, es una tabla de
// calendario conocida de antemano, no datos de usuario.
export function partirFechaHora(fechaIso) {
  if (!fechaIso) return { fecha: null, hora: null, dia: null };
  const [fecha, horaCompleta] = fechaIso.split('T');
  const hora = horaCompleta ? horaCompleta.slice(0, 5) : null;
  const diaSemanaSanta = diasSemanaSantaMock.find((d) => d.fecha === fecha);
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
// un día de Semana Santa (de la misma tabla fija diasSemanaSantaMock) y una
// hora de salida sueltos, no un LocalDateTime -esto los junta en el formato
// que sí entiende el backend ("2027-03-21T21:00:00").
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
