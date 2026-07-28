import { diasSemanaSantaMock } from '../mock/diasSemanaSanta';

// TODO(iteración 2+): sustituir por lecturas a Firestore (calendario de la Semana Santa, RF-35).

export function getDiasSemanaSanta() {
  return Promise.resolve(diasSemanaSantaMock);
}
