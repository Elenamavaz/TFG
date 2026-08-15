import { apiFetch } from '../../infrastructure/api/apiClient';
import { Ciudad } from '../models';

// GET /ciudades y GET /ciudades/{id} son públicos (RI-01, ver SecurityConfig
// del backend): el ciudadano los consulta sin login.

export async function getCiudades() {
  const ciudades = await apiFetch('/ciudades');
  return ciudades.map((c) => new Ciudad(c));
}

export async function getCiudadPorId(ciudadId) {
  const ciudad = await apiFetch(`/ciudades/${ciudadId}`);
  return new Ciudad(ciudad);
}
