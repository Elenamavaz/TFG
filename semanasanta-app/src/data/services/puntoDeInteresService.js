import { apiFetch } from '../../infrastructure/api/apiClient';
import { PuntoDeInteres } from '../models';

// Editar un punto de interés que YA existe como tal (a diferencia de
// marcarPuntoDeInteres en recorridoService.js, que "convierte" un punto de
// paso simple en uno nuevo) -mismo PUT /puntos-de-interes/{id} que usa
// cualquier punto de interés, sin pasar por el recorrido para nada.
export async function actualizarPuntoDeInteres(puntoDeInteresId, datos) {
  const puntoDeInteres = await apiFetch(`/puntos-de-interes/${puntoDeInteresId}`, { method: 'PUT', body: datos });
  return new PuntoDeInteres(puntoDeInteres);
}
