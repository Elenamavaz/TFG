// Registro de entrega de una Notificacion a un Usuario concreto
// (equivale a usuarios/{id}/notificacionesEntregadas en Firestore).
export class EntregaNotificacion {
  constructor({ id, notificacionId, usuarioId, leida = false, fechaLectura = null }) {
    this.id = id;
    this.notificacionId = notificacionId; // genera: 1 Notificacion
    this.usuarioId = usuarioId; // recibe: 1 Usuario
    this.leida = leida;
    this.fechaLectura = fechaLectura;
  }
}
