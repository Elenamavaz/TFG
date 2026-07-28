import { procesionesMock } from '../mock/procesiones';

// TODO(iteración 2+): sustituir por lecturas a Firestore (colección `procesiones`).
// La posición en tiempo real (RNF-08) se leerá aparte desde `procesiones/{id}/posicionActual`.

export function getProcesionesPorCiudad(ciudadId) {
  return Promise.resolve(procesionesMock.filter((p) => p.ciudadId === ciudadId));
}

export function getProcesionPorId(procesionId) {
  const procesion = procesionesMock.find((p) => p.id === procesionId) ?? null;
  return Promise.resolve(procesion);
}

export function getProcesionEnCurso(ciudadId) {
  const procesion =
    procesionesMock.find((p) => p.ciudadId === ciudadId && p.estado === 'EN_CURSO') ?? null;
  return Promise.resolve(procesion);
}
