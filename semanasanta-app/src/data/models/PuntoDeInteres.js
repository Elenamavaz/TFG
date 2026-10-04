import { PuntoRuta } from './PuntoRuta';

export class PuntoDeInteres extends PuntoRuta {
  constructor({ id, ubicacionId, latitud = null, longitud = null, orden, horaPrevista, relacionId = null, nombre, descripcion = null, tipo = null, imagen = null }) {
    super({ id, ubicacionId, latitud, longitud, orden, horaPrevista, relacionId });
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.imagen = imagen;
  }
}
