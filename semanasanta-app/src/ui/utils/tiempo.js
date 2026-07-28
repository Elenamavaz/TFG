export function formatearDuracion(minutos) {
  const horas = Math.floor(minutos / 60);
  const restoMinutos = minutos % 60;
  if (horas === 0) return `${restoMinutos}min`;
  if (restoMinutos === 0) return `${horas}h`;
  return `${horas}h ${restoMinutos}min`;
}
