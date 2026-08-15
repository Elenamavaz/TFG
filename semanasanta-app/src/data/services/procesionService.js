import { apiFetch } from '../../infrastructure/api/apiClient';
import { Procesion } from '../models';

// GET /procesiones (con ciudadId o cofradiaId) y GET /procesiones/{id} son
// públicos (RI-01). La posición en tiempo real (RNF-08) se lee aparte, de
// GET /procesiones/{id}/ubicacion (pendiente de conectar).

export async function getProcesionesPorCiudad(ciudadId) {
  const procesiones = await apiFetch(`/procesiones?ciudadId=${ciudadId}`);
  return procesiones.map((p) => new Procesion(p));
}

export async function getProcesionesPorCofradia(cofradiaId) {
  const procesiones = await apiFetch(`/procesiones?cofradiaId=${cofradiaId}`);
  return procesiones.map((p) => new Procesion(p));
}

export async function getProcesionPorId(procesionId) {
  const procesion = await apiFetch(`/procesiones/${procesionId}`);
  return new Procesion(procesion);
}

// Sin endpoint propio en el backend para "la que está en curso": se deriva
// filtrando el listado de la ciudad, igual de válido para una lista que en
// la práctica es corta (procesiones de una ciudad en un año concreto).
export async function getProcesionEnCurso(ciudadId) {
  const procesiones = await getProcesionesPorCiudad(ciudadId);
  return procesiones.find((p) => p.estado === 'EN_CURSO') ?? null;
}
