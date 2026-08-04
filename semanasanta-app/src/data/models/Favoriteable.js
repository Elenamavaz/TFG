// <<interface>> Favoriteable: la implementan las entidades que un Usuario
// puede guardar como Favorito (el diagrama lo muestra realizado por
// Procesion; aquí lo extienden también Cofradia, Paso y Evento porque las
// cuatro son "favoriteables" desde las pantallas de listado/detalle).
export class Favoriteable {
  constructor() {
    if (new.target === Favoriteable) {
      throw new Error('Favoriteable es una interfaz: solo se usa mediante herencia.');
    }
  }

  getFavoritoRef() {
    throw new Error('Las clases que implementan Favoriteable deben definir getFavoritoRef().');
  }
}
