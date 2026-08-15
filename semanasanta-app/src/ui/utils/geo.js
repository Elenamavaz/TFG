const RADIO_TIERRA_KM = 6371;

function aRadianes(grados) {
  return (grados * Math.PI) / 180;
}

// Distancia entre dos puntos (fórmula de Haversine), en kilómetros. Ya no la
// usa arranqueCiudadano.js (Ciudad no tiene latitud/longitud en el backend
// real, ver Ciudad.js) -se deja para la geolocalización en tiempo real de
// procesiones (iteración 3), que sí la necesitará.
export function distanciaKm(lat1, lon1, lat2, lon2) {
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
