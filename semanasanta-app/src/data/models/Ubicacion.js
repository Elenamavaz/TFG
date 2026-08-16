// Alineado con UbicacionResponse del backend -- 2026-08-15: tiene id propio
// (no es un valor embebido sin identidad, como se asumía antes: Ubicacion es
// una entidad real y reutilizable en el backend, con su propio GET /ubicaciones/{id}).
export class Ubicacion {
  constructor({ id, latitud, longitud, direccion = null }) {
    this.id = id;
    this.latitud = latitud;
    this.longitud = longitud;
    this.direccion = direccion;
  }
}
