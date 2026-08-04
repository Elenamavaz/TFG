// <<abstract>> Notificacion: la emite una Cofradia, una JuntaCofradias o un
// Administrador. Aviso y Alerta son sus especializaciones concretas.
export class Notificacion {
  constructor({ id, titulo, tipo, fechaCreacion = new Date(), emisorId = null, emisorTipo = null }) {
    if (new.target === Notificacion) {
      throw new Error('Notificacion es una clase abstracta: no se puede instanciar directamente.');
    }
    this.id = id;
    this.titulo = titulo;
    this.tipo = tipo;
    this.fechaCreacion = fechaCreacion;
    this.emisorId = emisorId; // emite: Cofradia | JuntaCofradias | Administrador
    this.emisorTipo = emisorTipo;
  }
}
