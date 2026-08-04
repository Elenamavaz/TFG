// Una Procesion sigue (0..1) un Recorrido, compuesto por 1..* PuntoRuta.
export class Recorrido {
  constructor({ id, nombre = null, distanciaTotal = null, tiempoEstimado = null, puntos = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.distanciaTotal = distanciaTotal;
    this.tiempoEstimado = tiempoEstimado;
    this.puntos = puntos; // compuestoPor: 1..* PuntoRuta
  }
}
