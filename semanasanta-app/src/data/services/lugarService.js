import { apiFetch } from '../../infrastructure/api/apiClient';
import { Ubicacion } from '../models';

// "lugar" y no "ubicacion" a propósito: ese nombre ya lo tiene
// ubicacionService.js, que es el GPS del propio dispositivo (permisos,
// posición actual) -cosa completamente distinta a la entidad Ubicacion del
// backend (dónde se celebra un Evento/Procesion). GET /ubicaciones/{id} es
// público.
export async function getUbicacionPorId(ubicacionId) {
  const ubicacion = await apiFetch(`/ubicaciones/${ubicacionId}`);
  return new Ubicacion(ubicacion);
}

// -- Gestión (panel de Junta, mockup del 2026-08-22, FormularioEventoScreen):
// las escrituras exigen JWT de cualquier Junta en el backend (Ubicacion no
// tiene dueño único, ver UbicacionService). Sin geocodificación (dirección
// en texto -> coordenadas) en ningún sitio del proyecto todavía -de ahí que
// el formulario pida latitud/longitud sueltas además de la dirección, no
// solo la dirección como en el mockup original.

export async function crearUbicacion(datos) {
  const ubicacion = await apiFetch('/ubicaciones', { method: 'POST', body: datos });
  return new Ubicacion(ubicacion);
}

export async function actualizarUbicacion(ubicacionId, datos) {
  const ubicacion = await apiFetch(`/ubicaciones/${ubicacionId}`, { method: 'PUT', body: datos });
  return new Ubicacion(ubicacion);
}
