import { Favoriteable } from './Favoriteable';

export class Procesion extends Favoriteable {
  constructor({
    id,
    ciudadId,
    cofradiaId,
    pasoIds = [],
    recorrido = null,
    nombre,
    dia,
    horaSalida = null,
    duracionMin = null,
    nazarenos = null,
    estado,
    fechaInicio = null,
    fechaFin = null,
    historia = null,
    origen = null,
    webOficial = null,
  }) {
    super();
    this.id = id;
    this.ciudadId = ciudadId;
    // FK directa de conveniencia: la relación formal del diagrama es
    // Cofradia -posee-> Paso -desfilan-> Procesion (sin arista directa a Cofradia).
    this.cofradiaId = cofradiaId;
    this.pasoIds = pasoIds; // desfilan: 1..* Paso
    this.recorrido = recorrido; // sigue: 0..1 Recorrido
    this.nombre = nombre;
    this.dia = dia;
    this.horaSalida = horaSalida;
    this.duracionMin = duracionMin;
    this.nazarenos = nazarenos;
    this.estado = estado;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.historia = historia;
    this.origen = origen;
    this.webOficial = webOficial;
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'procesion' };
  }
}
