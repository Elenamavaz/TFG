import { Notificacion } from './Notificacion';

export class Aviso extends Notificacion {
  constructor({
    id,
    titulo,
    tipo,
    fechaCreacion,
    emisorId,
    emisorTipo,
    fechaExpiracion = null,
    activa = true,
  }) {
    super({ id, titulo, tipo, fechaCreacion, emisorId, emisorTipo });
    this.fechaExpiracion = fechaExpiracion;
    this.activa = activa;
  }
}
