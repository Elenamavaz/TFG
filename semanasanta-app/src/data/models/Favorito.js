// Un Usuario guarda (0..*) referencias a elementos Favoriteable.
export class Favorito {
  constructor({ id, fechaGuardado = new Date(), usuarioId, elementoId, elementoTipo }) {
    this.id = id;
    this.fechaGuardado = fechaGuardado;
    this.usuarioId = usuarioId; // guarda: 1 Usuario
    this.elementoId = elementoId; // referencia: 1 Favoriteable (id)
    this.elementoTipo = elementoTipo; // 'cofradia' | 'procesion' | 'paso' | 'evento'
  }
}
