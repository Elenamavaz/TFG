import { Favoriteable } from './Favoriteable';

// Campos alineados con PasoResponse del backend -- 2026-08-15: se quitaron
// tipo (misterio/palio, sin equivalente en el backend), descripcion
// (renombrado: el backend lo llama historia) y webOficial (sin equivalente);
// analisis pasa a llamarse analisisArtistico.
export class Paso extends Favoriteable {
  constructor({ id, cofradiaId, nombre, historia = null, analisisArtistico = null, imagen = null }) {
    super();
    this.id = id;
    this.cofradiaId = cofradiaId; // posee: 1 Cofradia
    this.nombre = nombre;
    this.historia = historia;
    this.analisisArtistico = analisisArtistico;
    this.imagen = imagen;
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'paso' };
  }
}
