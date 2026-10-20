import { anioSemanaSantaVigente, diasSemanaSantaDe } from '../utils';

// Días de la Semana Santa en vigor (la próxima, o la actual mientras dura),
// calculados a partir de la fecha de hoy -ver fechaSemanaSanta.diasSemanaSantaDe.
// Antes devolvía una tabla fija de 2027 (bug 13 de bugs.md).
export function getDiasSemanaSanta() {
  return Promise.resolve(diasSemanaSantaDe(anioSemanaSantaVigente()));
}
