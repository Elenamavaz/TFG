import { api } from '../../infrastructure';
import * as models from '../models';

// GET /cofradias?ciudadId= y GET /cofradias/{id} son públicos (RI-01): solo
// devuelven las activas, es lo que ve el ciudadano.

export async function getCofradiasPorCiudad(ciudadId) {
  const cofradias = await api.apiFetch(`/cofradias?ciudadId=${ciudadId}`);
  return cofradias.map((c) => new models.Cofradia(c));
}

export async function getCofradiaPorId(cofradiaId) {
  const cofradia = await api.apiFetch(`/cofradias/${cofradiaId}`);
  return new models.Cofradia(cofradia);
}

// -- Gestión (panel de Junta, mockup del 2026-08-22): las escrituras exigen
// JWT de Junta de la ciudad en el backend.

// incluirInactivas=true: la Junta necesita ver también las suyas
// desactivadas para poder reactivarlas -mismo patrón que getCiudadesAdmin.
export async function getCofradiasGestion(ciudadId) {
  const cofradias = await api.apiFetch(`/cofradias?ciudadId=${ciudadId}&incluirInactivas=true`);
  return cofradias.map((c) => new models.Cofradia(c));
}

export async function crearCofradia(datos) {
  const cofradia = await api.apiFetch('/cofradias', { method: 'POST', body: datos });
  return new models.Cofradia(cofradia);
}

export async function actualizarCofradia(cofradiaId, datos) {
  const cofradia = await api.apiFetch(`/cofradias/${cofradiaId}`, { method: 'PUT', body: datos });
  return new models.Cofradia(cofradia);
}

export async function eliminarCofradia(cofradiaId) {
  await api.apiFetch(`/cofradias/${cofradiaId}`, { method: 'DELETE' });
}
