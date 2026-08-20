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

// Gestión (panel de Junta, mockup del 2026-08-20): las escrituras exigen JWT
// de Junta de la ciudad en el backend.

export async function crearProcesion(datos) {
  const procesion = await apiFetch('/procesiones', { method: 'POST', body: datos });
  return new Procesion(procesion);
}

export async function actualizarProcesion(id, datos) {
  const procesion = await apiFetch(`/procesiones/${id}`, { method: 'PUT', body: datos });
  return new Procesion(procesion);
}

export async function eliminarProcesion(id) {
  await apiFetch(`/procesiones/${id}`, { method: 'DELETE' });
}

// "Cancelar" de la lista de Procesiones: la procesión sigue existiendo, solo
// cambia de estado -distinto de eliminarProcesion. mensaje/prioridad son los
// de la Notificacion CANCELACION que el backend genera de paso (2026-08-20):
// antes de esto cancelar no avisaba a nadie.
export async function cancelarProcesion(id, { mensaje, prioridad }) {
  const procesion = await apiFetch(`/procesiones/${id}/cancelar`, {
    method: 'POST',
    body: { mensaje: mensaje || null, prioridad },
  });
  return new Procesion(procesion);
}
