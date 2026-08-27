import { Favoriteable } from './Favoriteable';

// Campos alineados con CofradiaResponse del backend -- 2026-08-15: se quitó
// webOficial (duplicaba a web en el mock/diseño original, el backend solo
// tiene el segundo). "activa" añadido el 2026-08-22, mismo patrón que
// Ciudad.activa: permite a la Junta dar de alta una cofradía mientras la
// sigue completando, sin que el ciudadano la vea todavía.
export class Cofradia extends Favoriteable {
  constructor({ id, ciudadId, nombre, historia = null, web = null, fechaCreacion = new Date(), activa = true }) {
    super();
    this.id = id;
    this.ciudadId = ciudadId;
    this.nombre = nombre;
    this.historia = historia;
    this.web = web;
    this.fechaCreacion = fechaCreacion;
    this.activa = activa;
    // pasos/procesiones/eventos NO se guardan aquí como arrays: son relaciones
    // inversas (Paso.cofradiaId "posee", Evento.cofradiaId "organiza", y
    // Procesion vía Paso "desfilan"), resueltas por los servicios para no
    // duplicar datos que haya que mantener sincronizados a mano.
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'cofradia' };
  }
}
