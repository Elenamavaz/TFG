import { api } from '../../infrastructure';

// Ping de posición de un Cofrade compartiendo ubicación durante una
// procesión (2026-08-21, ver CofradeContext). A diferencia del resto de
// apiFetch, que lee el JWT de sesión de Junta/Admin (ver apiClient.js), aquí
// el token se pasa explícito: el Cofrade no tiene sesión guardada como esos
// roles (su JWT vive solo en memoria mientras dura "compartir ubicación",
// ver CofradeContext), y un header pasado a mano ya gana al de la sesión
// global en apiFetch.
export async function registrarPosicion(procesionId, latitud, longitud, token) {
  return api.apiFetch(`/procesiones/${procesionId}/posiciones`, {
    method: 'POST',
    body: { latitud, longitud },
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Mapa en vivo (2026-10-03). Los dos son GET públicos: el ciudadano sin
// sesión ve dónde va la procesión.
//
// Estela: tramo del recorrido ocupado ahora mismo por la procesión, como
// fracciones (0..1) de su longitud -desde el cofrade más atrasado (cola)
// hasta el más adelantado (cabeza)-, ver EstelaProcesionResponse del
// backend. Solo avanza, nunca retrocede. Las dos a 0 = aún no hay pings.
export async function getEstelaProcesion(procesionId) {
  return api.apiFetch(`/procesiones/${procesionId}/estela`);
}
