import { Favoriteable } from './Favoriteable';

export class Paso extends Favoriteable {
  constructor({
    id,
    cofradiaId,
    nombre,
    tipo = null,
    descripcion = null,
    analisis = null,
    webOficial = null,
    imagen = null,
  }) {
    super();
    this.id = id;
    this.cofradiaId = cofradiaId; // posee: 1 Cofradia
    this.nombre = nombre;
    this.tipo = tipo;
    this.descripcion = descripcion;
    this.analisis = analisis;
    this.webOficial = webOficial;
    this.imagen = imagen;
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'paso' };
  }
}
