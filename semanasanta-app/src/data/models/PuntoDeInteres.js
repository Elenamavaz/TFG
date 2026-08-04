import { PuntoRuta } from './PuntoRuta';

export class PuntoDeInteres extends PuntoRuta {
  constructor({ id, horaEnviada, nombre, descripcion = null, tipo = null, imagen = null }) {
    super({ id, horaEnviada });
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.imagen = imagen;
  }
}
