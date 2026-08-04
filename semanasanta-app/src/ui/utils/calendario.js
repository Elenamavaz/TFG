function pad2(numero) {
  return String(numero).padStart(2, '0');
}

export function formatearFechaISO(fecha) {
  return `${fecha.getFullYear()}-${pad2(fecha.getMonth() + 1)}-${pad2(fecha.getDate())}`;
}

// Índice de la semana con lunes primero (0 = lunes ... 6 = domingo),
// para que coincida con la fila L M X J V S D del calendario.
export function obtenerIndiceSemana(fecha) {
  return (fecha.getDay() + 6) % 7;
}

// Matriz de semanas del mes indicado (mesIndex: 0 = enero). Cada celda es
// { numero, fecha: 'YYYY-MM-DD' } o null cuando es relleno fuera de mes.
export function obtenerMatrizMes(anio, mesIndex) {
  const primerDia = new Date(anio, mesIndex, 1);
  const totalDias = new Date(anio, mesIndex + 1, 0).getDate();
  const celdas = [];

  for (let i = 0; i < obtenerIndiceSemana(primerDia); i++) celdas.push(null);
  for (let numero = 1; numero <= totalDias; numero++) {
    celdas.push({ numero, fecha: formatearFechaISO(new Date(anio, mesIndex, numero)) });
  }
  while (celdas.length % 7 !== 0) celdas.push(null);

  const semanas = [];
  for (let i = 0; i < celdas.length; i += 7) semanas.push(celdas.slice(i, i + 7));
  return semanas;
}

// Los 7 días (lunes a domingo, en ese orden) de la semana que contiene fechaISO.
export function obtenerSemanaDe(fechaISO) {
  const [anio, mes, dia] = fechaISO.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const lunes = new Date(anio, mes - 1, dia - obtenerIndiceSemana(fecha));

  return Array.from({ length: 7 }, (_, i) => {
    const actual = new Date(lunes.getFullYear(), lunes.getMonth(), lunes.getDate() + i);
    return { numero: actual.getDate(), fecha: formatearFechaISO(actual) };
  });
}
