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
// Posición media de los cofrades en el último minuto (GET
// /procesiones/{id}/ubicacion). Para el mapa, en las procesiones SIN
// recorrido: sin él no hay estela que pintar, pero sí dónde está ahora
// (bug 18). null si todavía no ha llegado ningún ping (el backend da 404).
export async function getPosicionActualProcesion(procesionId) {
  try {
    const posicion = await api.apiFetch(`/procesiones/${procesionId}/ubicacion`);
    return { latitude: posicion.latitud, longitude: posicion.longitud, cofradesActivos: posicion.cofradesActivos };
  } catch {
    return null;
  }
}

export async function getEstelaProcesion(procesionId) {
  return api.apiFetch(`/procesiones/${procesionId}/estela`);
}
