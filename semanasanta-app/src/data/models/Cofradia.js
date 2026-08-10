import { Favoriteable } from './Favoriteable';

export class Cofradia extends Favoriteable {
  constructor({
    id,
    ciudadId,
    nombre,
    historia = null,
    web = null,
    fechaCreacion = new Date(),
    webOficial = null,
  }) {
    super();
    this.id = id;
    this.ciudadId = ciudadId;
    this.nombre = nombre;
    this.historia = historia;
    this.web = web;
    this.fechaCreacion = fechaCreacion;
    this.webOficial = webOficial;
    // pasos/procesiones/eventos NO se guardan aquí como arrays: son relaciones
    // inversas (Paso.cofradiaId "posee", Evento.cofradiaId "organiza", y
    // Procesion vía Paso "desfilan"), resueltas por los servicios para no
    // duplicar datos que haya que mantener sincronizados a mano.
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'cofradia' };
  }
}
