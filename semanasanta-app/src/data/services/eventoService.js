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
