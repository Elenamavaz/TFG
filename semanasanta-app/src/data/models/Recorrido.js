// Alineado con RecorridoResponse del backend -- 2026-08-15: sin "nombre", el
// backend no lo tiene. "puntos" no viene incluido en GET /recorridos/{id}
// (son una relación aparte, GET /recorridos/{id}/puntos-ruta, con su propio
// orden/horaPrevista): se rellena con una llamada extra, ver recorridoService.js.
export class Recorrido {
  constructor({ id, distanciaTotal = null, tiempoEstimado = null, puntos = [] }) {
    this.id = id;
    this.distanciaTotal = distanciaTotal;
    this.tiempoEstimado = tiempoEstimado;
    this.puntos = puntos; // compuestoPor: 1..* PuntoRuta
  }
}
