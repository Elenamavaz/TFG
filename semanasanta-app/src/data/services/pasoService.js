import { apiFetch } from '../../infrastructure/api/apiClient';
import { Paso } from '../models';

// GET /pasos?cofradiaId= y GET /pasos/{id} son públicos (RI-01).

export async function getPasosPorCofradia(cofradiaId) {
  const pasos = await apiFetch(`/pasos?cofradiaId=${cofradiaId}`);
  return pasos.map((p) => new Paso(p));
}

// Sin endpoint "por lista de ids" en el backend: una petición por id, en
// paralelo. Se usa con pocos elementos a la vez (los pasos de una
// procesión concreta), no con listados grandes.
export async function getPasosPorIds(pasoIds) {
  const pasos = await Promise.all(pasoIds.map((id) => getPasoPorId(id)));
  return pasos;
}

export async function getPasoPorId(pasoId) {
  const paso = await apiFetch(`/pasos/${pasoId}`);
  return new Paso(paso);
}
