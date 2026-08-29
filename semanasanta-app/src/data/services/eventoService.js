import { apiFetch } from '../../infrastructure/api/apiClient';
import { Evento } from '../models';

// GET /eventos (con ciudadId o cofradiaId) y GET /eventos/{id} son públicos (RI-01).

export async function getEventosPorCiudad(ciudadId) {
  const eventos = await apiFetch(`/eventos?ciudadId=${ciudadId}`);
  return eventos.map((e) => new Evento(e));
}

export async function getEventosPorCofradia(cofradiaId) {
  const eventos = await apiFetch(`/eventos?cofradiaId=${cofradiaId}`);
  return eventos.map((e) => new Evento(e));
}

export async function getEventoPorId(eventoId) {
  const evento = await apiFetch(`/eventos/${eventoId}`);
  return new Evento(evento);
}

// -- Gestión (panel de Junta, mockup del 2026-08-22): las escrituras exigen
// JWT de Junta de la ciudad en el backend.

export async function crearEvento(datos) {
  const evento = await apiFetch('/eventos', { method: 'POST', body: datos });
  return new Evento(evento);
}

export async function actualizarEvento(eventoId, datos) {
  const evento = await apiFetch(`/eventos/${eventoId}`, { method: 'PUT', body: datos });
  return new Evento(evento);
}

export async function eliminarEvento(eventoId) {
  await apiFetch(`/eventos/${eventoId}`, { method: 'DELETE' });
}

// "Cancelar" (2026-08-23): mismo patrón que cancelarProcesion -el evento
// sigue existiendo, solo cambia de estado, y genera un aviso al ciudadano.
export async function cancelarEvento(eventoId, datos) {
  const evento = await apiFetch(`/eventos/${eventoId}/cancelar`, { method: 'POST', body: datos });
  return new Evento(evento);
}
