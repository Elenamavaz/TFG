const RADIO_TIERRA_KM = 6371;

function aRadianes(grados) {
  return (grados * Math.PI) / 180;
}

// Distancia entre dos puntos (fórmula de Haversine), en kilómetros.
export function distanciaKm(lat1, lon1, lat2, lon2) {
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return RADIO_TIERRA_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Recuperada el 2026-08-23 (Ciudad ya tiene latitud/longitud en el backend
// real, ver Ciudad.java/migración V38): de todas las ciudades ACTIVAS con
// coordenadas guardadas, la más próxima a la posición dada -o null si
// ninguna tiene coordenadas todavía. Usada por arranqueCiudadano.js para
// preseleccionar ciudad al entrar como Ciudadano sin ninguna guardada.
export function ciudadMasCercana(ciudades, { latitud, longitud }) {
  const conCoordenadas = ciudades.filter((c) => c.activa && c.latitud != null && c.longitud != null);
  if (conCoordenadas.length === 0) return null;

  return conCoordenadas.reduce((masCercana, actual) => {
    const distanciaActual = distanciaKm(latitud, longitud, actual.latitud, actual.longitud);
    const distanciaMasCercana = distanciaKm(latitud, longitud, masCercana.latitud, masCercana.longitud);
    return distanciaActual < distanciaMasCercana ? actual : masCercana;
  });
}
