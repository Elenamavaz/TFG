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

// Ciudad del listado cuyo centro está más cerca de (latitud, longitud); null si ninguna tiene coordenadas.
export function ciudadMasCercana(ciudades, latitud, longitud) {
  let mejor = null;
  let mejorDistancia = Infinity;

  for (const ciudad of ciudades) {
    if (ciudad.latitud == null || ciudad.longitud == null) continue;
    const distancia = distanciaKm(latitud, longitud, ciudad.latitud, ciudad.longitud);
    if (distancia < mejorDistancia) {
      mejor = ciudad;
      mejorDistancia = distancia;
    }
  }

  return mejor;
}
