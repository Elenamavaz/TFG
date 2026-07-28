import { ciudadesMock } from '../mock/ciudades';

// TODO(iteración 2+): sustituir por lecturas a Firestore (colección `ciudades`),
// manteniendo esta misma firma para no tener que tocar las pantallas (patrón Repository).

export function getCiudades() {
  return Promise.resolve(ciudadesMock);
}

export function getCiudadPorId(ciudadId) {
  const ciudad = ciudadesMock.find((c) => c.id === ciudadId) ?? null;
  return Promise.resolve(ciudad);
}
