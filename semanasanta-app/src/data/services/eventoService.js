import { eventosMock } from '../mock/eventos';
import { cofradiasMock } from '../mock/cofradias';

// TODO(iteración 2+): sustituir por lecturas a Firestore (colección `eventos`).

function cofradiaIdsDe(ciudadId) {
  return cofradiasMock.filter((c) => c.ciudadId === ciudadId).map((c) => c.id);
}

export function getEventosPorCiudad(ciudadId) {
  const ids = cofradiaIdsDe(ciudadId);
  return Promise.resolve(eventosMock.filter((e) => ids.includes(e.cofradiaId)));
}

export function getEventoPorId(eventoId) {
  const evento = eventosMock.find((e) => e.id === eventoId) ?? null;
  return Promise.resolve(evento);
}

export function getEventosPorCofradia(cofradiaId) {
  return Promise.resolve(eventosMock.filter((e) => e.cofradiaId === cofradiaId));
}
