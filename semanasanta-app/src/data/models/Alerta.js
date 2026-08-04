import { Notificacion } from './Notificacion';

export class Alerta extends Notificacion {
  constructor({
    id,
    titulo,
    tipo,
    fechaCreacion,
    emisorId = null,
    emisorTipo = null,
    tipoAlerta,
    prioridad,
    texto,
    ciudadId = null,
    dia = null,
    procesionId = null,
    eventoId = null,
  }) {
    super({ id, titulo, tipo, fechaCreacion, emisorId, emisorTipo });
    this.tipoAlerta = tipoAlerta;
    this.prioridad = prioridad;
    this.texto = texto;
    this.ciudadId = ciudadId;
    this.dia = dia;
    this.procesionId = procesionId; // a qué Procesion afecta (si aplica)
    this.eventoId = eventoId; // o a qué Evento afecta (si aplica)
  }
}
