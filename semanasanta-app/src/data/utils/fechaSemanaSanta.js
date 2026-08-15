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
