import { pasosMock } from '../mock/pasos';

// TODO(iteración 2+): sustituir por lecturas a Firestore (subcolección `cofradias/{id}/pasos`).

export function getPasosPorCofradia(cofradiaId) {
  return Promise.resolve(pasosMock.filter((p) => p.cofradiaId === cofradiaId));
}

export function getPasosPorIds(pasoIds) {
  return Promise.resolve(pasosMock.filter((p) => pasoIds.includes(p.id)));
}

export function getPasoPorId(pasoId) {
  const paso = pasosMock.find((p) => p.id === pasoId) ?? null;
  return Promise.resolve(paso);
}
