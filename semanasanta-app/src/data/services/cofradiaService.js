import { cofradiasMock } from '../mock/cofradias';

// TODO(iteración 2+): sustituir por lecturas a Firestore (colección `cofradias`).

export function getCofradiasPorCiudad(ciudadId) {
  return Promise.resolve(cofradiasMock.filter((c) => c.ciudadId === ciudadId));
}

export function getCofradiaPorId(cofradiaId) {
  const cofradia = cofradiasMock.find((c) => c.id === cofradiaId) ?? null;
  return Promise.resolve(cofradia);
}
