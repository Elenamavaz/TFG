import { apiFetch } from '../../infrastructure/api/apiClient';
import { Cofradia } from '../models';

// GET /cofradias?ciudadId= y GET /cofradias/{id} son públicos (RI-01): solo
// devuelven las activas, es lo que ve el ciudadano.

export async function getCofradiasPorCiudad(ciudadId) {
  const cofradias = await apiFetch(`/cofradias?ciudadId=${ciudadId}`);
  return cofradias.map((c) => new Cofradia(c));
}

export async function getCofradiaPorId(cofradiaId) {
  const cofradia = await apiFetch(`/cofradias/${cofradiaId}`);
  return new Cofradia(cofradia);
}

// -- Gestión (panel de Junta, mockup del 2026-08-22): las escrituras exigen
// JWT de Junta de la ciudad en el backend.

// incluirInactivas=true: la Junta necesita ver también las suyas
// desactivadas para poder reactivarlas -mismo patrón que getCiudadesAdmin.
export async function getCofradiasGestion(ciudadId) {
  const cofradias = await apiFetch(`/cofradias?ciudadId=${ciudadId}&incluirInactivas=true`);
  return cofradias.map((c) => new Cofradia(c));
}

export async function crearCofradia(datos) {
  const cofradia = await apiFetch('/cofradias', { method: 'POST', body: datos });
  return new Cofradia(cofradia);
}

export async function actualizarCofradia(cofradiaId, datos) {
  const cofradia = await apiFetch(`/cofradias/${cofradiaId}`, { method: 'PUT', body: datos });
  return new Cofradia(cofradia);
}

export async function eliminarCofradia(cofradiaId) {
  await apiFetch(`/cofradias/${cofradiaId}`, { method: 'DELETE' });
}
