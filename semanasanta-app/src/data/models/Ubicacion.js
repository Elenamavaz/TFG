// Valor embebido (no tiene id propio): dónde se celebra un Evento.
export class Ubicacion {
  constructor({ latitud, longitud, direccion = null }) {
    this.latitud = latitud;
    this.longitud = longitud;
    this.direccion = direccion;
  }
}
