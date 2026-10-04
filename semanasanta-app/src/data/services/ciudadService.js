import { api } from '../../infrastructure';
import * as models from '../models';

// GET /ciudades y GET /ciudades/{id} son públicos (RI-01, ver SecurityConfig
// del backend): el ciudadano los consulta sin login. Sin incluirInactivas,
// solo devuelve las activas -es lo que ve el ciudadano en el selector de ciudad.

export async function getCiudades() {
  const ciudades = await api.apiFetch('/ciudades');
  return ciudades.map((c) => new models.Ciudad(c));
}

export async function getCiudadPorId(ciudadId) {
  const ciudad = await api.apiFetch(`/ciudades/${ciudadId}`);
  return new models.Ciudad(ciudad);
}

// -- Gestión (panel de Administrador): las escrituras exigen JWT de
// Administrador en el backend (CiudadService.exigirAdministrador), así que
// solo tienen sentido llamadas desde ese panel, con sesión ya iniciada.

// incluirInactivas=true: el Administrador necesita ver también las
// desactivadas para poder reactivarlas, no solo las que ve el ciudadano.
export async function getCiudadesAdmin() {
  const ciudades = await api.apiFetch('/ciudades?incluirInactivas=true');
  return ciudades.map((c) => new models.Ciudad(c));
}

export async function crearCiudad(datos) {
  const ciudad = await api.apiFetch('/ciudades', { method: 'POST', body: datos });
  return new models.Ciudad(ciudad);
}

export async function actualizarCiudad(ciudadId, datos) {
  const ciudad = await api.apiFetch(`/ciudades/${ciudadId}`, { method: 'PUT', body: datos });
  return new models.Ciudad(ciudad);
}

// Junta de la ciudad (2026-10-03): solo historia y patrimonio, el resto de
// la ciudad sigue siendo cosa del Administrador (actualizarCiudad).
export async function actualizarInformacionCiudad(ciudadId, { historia, patrimonio }) {
  const ciudad = await api.apiFetch(`/ciudades/${ciudadId}/informacion`, {
    method: 'PUT',
    body: { historia, patrimonio },
  });
  return new models.Ciudad(ciudad);
}

export async function eliminarCiudad(ciudadId) {
  await api.apiFetch(`/ciudades/${ciudadId}`, { method: 'DELETE' });
}
