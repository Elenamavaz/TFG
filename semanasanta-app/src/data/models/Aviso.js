import { Notificacion } from './Notificacion';

// Campos alineados con NotificacionResponse del backend cuando tipo="AVISO"
// -- 2026-08-15: se quitó "activa" (el backend no la calcula ni la guarda) y
// emisorId/emisorTipo (no expuestos). Se añade ciudadId. "activa" se
// recupera como propiedad calculada (sin fechaExpiracion, o con ella en el
// futuro) en vez de venir del backend.
export class Aviso extends Notificacion {
  constructor({ id, titulo, fechaCreacion, fechaExpiracion = null, ciudadId = null }) {
    super({ id, titulo, tipo: 'AVISO', fechaCreacion });
    this.fechaExpiracion = fechaExpiracion;
    this.ciudadId = ciudadId;
  }

  get activa() {
    return !this.fechaExpiracion || new Date(this.fechaExpiracion) > new Date();
  }

  // Un Aviso es siempre informativo, nunca grave (ver Alerta.colorCategoria).
  get colorCategoria() {
    return 'verde';
  }
}
