// Todas las listas de la app (Ciudades, Juntas, Cofradías, Procesiones,
// Eventos, Pasos, Miembros...) se muestran ordenadas alfabéticamente por
// nombre, sin depender del orden en que las devuelva el backend.
export function ordenarPorNombre(lista, obtenerNombre = (item) => item.nombre) {
  return [...lista].sort((a, b) => obtenerNombre(a).localeCompare(obtenerNombre(b), 'es'));
}
