import { Notificacion } from './Notificacion';

// Campos alineados con NotificacionResponse del backend cuando tipo="ALERTA"
// -- 2026-08-15: se quitaron texto (el backend no tiene cuerpo de mensaje,
// solo titulo), dia/procesionId/eventoId (una Alerta solo está ligada a una
// ciudad, no a un día de Semana Santa ni a una procesión/evento concreto) y
// emisorId/emisorTipo (no expuestos por el backend). Se añade ciudadId.
export class Alerta extends Notificacion {
  constructor({ id, titulo, fechaCreacion, tipoAlerta, prioridad, ciudadId = null }) {
    super({ id, titulo, tipo: 'ALERTA', fechaCreacion });
    this.tipoAlerta = tipoAlerta;
    this.prioridad = prioridad;
    this.ciudadId = ciudadId;
  }

  // Decisión de Elena (2026-08-15): color de la tarjeta según prioridad,
  // no según tipoAlerta -ALTA/URGENTE es lo grave, MEDIA un aviso a medias,
  // BAJA se trata como un Aviso normal (ver Aviso.colorCategoria).
  get colorCategoria() {
    if (this.prioridad === 'ALTA' || this.prioridad === 'URGENTE') return 'roja';
    if (this.prioridad === 'MEDIA') return 'naranja';
    return 'verde';
  }
}
