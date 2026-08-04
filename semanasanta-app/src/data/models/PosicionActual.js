// Posición GPS que un Cofrade comparte mientras desfila (relación "comparte",
// 0..*). El agregado más reciente por procesión es el que se expone en
// procesiones/{id}/posicionActual (ver esquema Firestore).
export class PosicionActual {
  constructor({ id, latitud, longitud, timestamp = new Date(), cofradeId, procesionId = null }) {
    this.id = id;
    this.latitud = latitud;
    this.longitud = longitud;
    this.timestamp = timestamp;
    this.cofradeId = cofradeId; // comparte: 1 Cofrade
    this.procesionId = procesionId;
  }
}
