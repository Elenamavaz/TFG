// <<abstract>> Usuario: base común de las personas que usan la app (todas menos
// el ciudadano, que no se registra). Cofrade hereda de aquí.
export class Usuario {
  constructor({ id, fechaIngreso = new Date() }) {
    if (new.target === Usuario) {
      throw new Error('Usuario es una clase abstracta: no se puede instanciar directamente.');
    }
    this.id = id;
    this.fechaIngreso = fechaIngreso;
  }
}
