import { apiFetch } from '../../infrastructure/api/apiClient';

// Ping de posición de un Cofrade compartiendo ubicación durante una
// procesión (2026-08-21, ver CofradeContext). A diferencia del resto de
// apiFetch, que lee el JWT de sesión de Junta/Admin (ver apiClient.js), aquí
// el token se pasa explícito: el Cofrade no tiene sesión guardada como esos
// roles (su JWT vive solo en memoria mientras dura "compartir ubicación",
// ver CofradeContext), y un header pasado a mano ya gana al de la sesión
// global en apiFetch.
export async function registrarPosicion(procesionId, latitud, longitud, token) {
  return apiFetch(`/procesiones/${procesionId}/posiciones`, {
    method: 'POST',
    body: { latitud, longitud },
    headers: { Authorization: `Bearer ${token}` },
  });
}
