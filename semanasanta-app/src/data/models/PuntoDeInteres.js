import { PuntoRuta } from './PuntoRuta';

export class PuntoDeInteres extends PuntoRuta {
  constructor({ id, ubicacionId, orden, horaPrevista, nombre, descripcion = null, tipo = null, imagen = null }) {
    super({ id, ubicacionId, orden, horaPrevista });
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.imagen = imagen;
  }
}
