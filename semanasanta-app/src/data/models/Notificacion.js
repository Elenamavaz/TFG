// Sustituye a la jerarquía Notificacion/Aviso/Alerta (2026-08-20): el backend
// colapsó las tres clases en una sola tabla -la diferencia real entre Aviso y
// Alerta era mínima (fechaExpiracion vs tipoAlerta+prioridad) y esa
// distinción no se estaba ganando su sitio (el color de la tarjeta ya se
// decidía solo por prioridad, nunca por tipoAlerta -ver el colorCategoria de
// abajo, que generaliza el de las dos clases viejas). Campos alineados con
// NotificacionResponse del backend.
export class Notificacion {
  constructor({ id, titulo, mensaje = null, fechaCreacion, ciudadId = null, tipo, prioridad = null, fechaExpiracion = null }) {
    this.id = id;
    this.titulo = titulo;
    this.mensaje = mensaje; // razón libre: "corte en Calle X por aforo", etc.
    this.fechaCreacion = fechaCreacion;
    this.ciudadId = ciudadId;
    this.tipo = tipo; // INICIO | FIN | INCIDENCIA | CAMBIO_HORARIO | CANCELACION
    this.prioridad = prioridad; // null en INICIO/FIN (automáticas, sin prioridad que asignar)
    this.fechaExpiracion = fechaExpiracion;
  }

  // Sin fechaExpiracion, nunca caduca (mismo criterio que antes en Aviso.activa).
  get activa() {
    return !this.fechaExpiracion || new Date(this.fechaExpiracion) > new Date();
  }

  // Decisión de Elena (2026-08-15, generalizada aquí el 2026-08-20): color de
  // la tarjeta según prioridad, no según tipo -ALTA es lo grave, MEDIA un
  // aviso a medias. Sin prioridad (INICIO/FIN, automáticas) se trata como
  // informativo, igual que antes hacía Aviso.colorCategoria siempre. Sin
  // URGENTE desde el 2026-08-22 -ya pintaba el mismo rojo que ALTA, no
  // aportaba un nivel realmente distinto.
  get colorCategoria() {
    if (this.prioridad === 'ALTA') return 'roja';
    if (this.prioridad === 'MEDIA') return 'naranja';
    return 'verde';
  }
}
