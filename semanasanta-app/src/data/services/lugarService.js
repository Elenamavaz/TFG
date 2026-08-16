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
