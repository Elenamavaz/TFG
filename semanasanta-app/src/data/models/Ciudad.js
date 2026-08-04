export class Ciudad {
  constructor({
    id,
    nombre,
    comunidadAutonoma,
    descripcion = null,
    numProcesiones = 0,
    numCofrades = 0,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.comunidadAutonoma = comunidadAutonoma;
    this.descripcion = descripcion;
    // Contadores denormalizados para la pantalla de Inicio; no son relaciones.
    this.numProcesiones = numProcesiones;
    this.numCofrades = numCofrades;
  }
}
