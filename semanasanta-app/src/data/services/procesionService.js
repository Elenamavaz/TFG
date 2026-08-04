import { procesionesMock } from '../mock/procesiones';
import { pasosMock } from '../mock/pasos';

// TODO(iteración 2+): sustituir por lecturas a Firestore (colección `procesiones`).
// La posición en tiempo real (RNF-08) se leerá aparte desde `procesiones/{id}/posicionActual`.

export function getProcesionesPorCiudad(ciudadId) {
  return Promise.resolve(procesionesMock.filter((p) => p.ciudadId === ciudadId));
}

// No hay FK directa Cofradia -> Procesion en el modelo: se resuelve vía la
// relación Cofradia -posee-> Paso -desfilan-> Procesion.
export function getProcesionesPorCofradia(cofradiaId) {
  const pasoIds = pasosMock.filter((p) => p.cofradiaId === cofradiaId).map((p) => p.id);
  const procesiones = procesionesMock.filter((p) => p.pasoIds.some((id) => pasoIds.includes(id)));
  return Promise.resolve(procesiones);
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
