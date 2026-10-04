import { api } from '../../infrastructure';
import * as models from '../models';

// GET /pasos?cofradiaId= y GET /pasos/{id} son públicos (RI-01).

export async function getPasosPorCofradia(cofradiaId) {
  const pasos = await api.apiFetch(`/pasos?cofradiaId=${cofradiaId}`);
  return pasos.map((p) => new models.Paso(p));
}

// Sin endpoint "por lista de ids" en el backend: una petición por id, en
// paralelo. Se usa con pocos elementos a la vez (los pasos de una
// procesión concreta), no con listados grandes.
export async function getPasosPorIds(pasoIds) {
  const pasos = await Promise.all(pasoIds.map((id) => getPasoPorId(id)));
  return pasos;
}

export async function getPasoPorId(pasoId) {
  const paso = await api.apiFetch(`/pasos/${pasoId}`);
  return new models.Paso(paso);
}

// -- Gestión (panel de Junta, mockup del 2026-08-22): las escrituras exigen
// JWT de Junta de la ciudad (dueña de la cofradía del paso) en el backend.

export async function crearPaso(datos) {
  const paso = await api.apiFetch('/pasos', { method: 'POST', body: datos });
  return new models.Paso(paso);
}

export async function actualizarPaso(pasoId, datos) {
  const paso = await api.apiFetch(`/pasos/${pasoId}`, { method: 'PUT', body: datos });
  return new models.Paso(paso);
}

export async function eliminarPaso(pasoId) {
  await api.apiFetch(`/pasos/${pasoId}`, { method: 'DELETE' });
}
