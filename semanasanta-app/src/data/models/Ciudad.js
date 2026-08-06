export class Ciudad {
  constructor({
    id,
    nombre,
    comunidadAutonoma,
    descripcion = null,
    numProcesiones = 0,
    numCofrades = 0,
    latitud = null,
    longitud = null,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.comunidadAutonoma = comunidadAutonoma;
    this.descripcion = descripcion;
    // Contadores denormalizados para la pantalla de Inicio; no son relaciones.
    this.numProcesiones = numProcesiones;
    this.numCofrades = numCofrades;
    // Centro de la ciudad, para seleccionar la más cercana a la geolocalización del dispositivo.
    this.latitud = latitud;
    this.longitud = longitud;
  }
}
