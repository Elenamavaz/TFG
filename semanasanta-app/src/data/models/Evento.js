import { Favoriteable } from './Favoriteable';

export class Evento extends Favoriteable {
  constructor({ id, cofradiaId, nombre, descripcion = null, fecha, hora = null, estado, ubicacion = null }) {
    super();
    this.id = id;
    this.cofradiaId = cofradiaId; // organiza: 1 Cofradia
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.fecha = fecha;
    this.hora = hora;
    this.estado = estado;
    this.ubicacion = ubicacion; // seCelebraEn: 0..1 Ubicacion
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'evento' };
  }
}
