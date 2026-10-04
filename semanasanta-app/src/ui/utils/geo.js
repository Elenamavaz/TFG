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

// --- Mapa en vivo (2026-10-03) ---------------------------------------------
// Las fracciones de la estela (0..1, ver getEstelaProcesion) son sobre la
// longitud total del recorrido: para dibujarlas hay que recorrer los puntos
// acumulando distancia e interpolar donde cae cada fracción. "puntos" son
// objetos {latitude, longitude} en orden, el formato de react-native-maps.

function distanciasAcumuladas(puntos) {
  const acumuladas = [0];
  for (let i = 1; i < puntos.length; i += 1) {
    const a = puntos[i - 1];
    const b = puntos[i];
    acumuladas.push(acumuladas[i - 1] + distanciaKm(a.latitude, a.longitude, b.latitude, b.longitude));
  }
  return acumuladas;
}

// Punto del recorrido a una distancia concreta desde el inicio (km).
function puntoADistancia(puntos, acumuladas, distancia) {
  if (distancia <= 0) return puntos[0];
  for (let i = 1; i < puntos.length; i += 1) {
    if (acumuladas[i] >= distancia) {
      const largoTramo = acumuladas[i] - acumuladas[i - 1];
      const t = largoTramo > 0 ? (distancia - acumuladas[i - 1]) / largoTramo : 0;
      const a = puntos[i - 1];
      const b = puntos[i];
      return { latitude: a.latitude + (b.latitude - a.latitude) * t, longitude: a.longitude + (b.longitude - a.longitude) * t };
    }
  }
  return puntos[puntos.length - 1];
}

// Trozo del recorrido entre dos fracciones (p.ej. cola y cabeza de la
// estela), con los extremos interpolados. Vacío si no hay tramo que pintar.
export function tramoDeRecorrido(puntos, desde, hasta) {
  if (puntos.length < 2 || hasta <= desde) return [];
  const acumuladas = distanciasAcumuladas(puntos);
  const total = acumuladas[acumuladas.length - 1];
  const dDesde = desde * total;
  const dHasta = hasta * total;
  const tramo = [puntoADistancia(puntos, acumuladas, dDesde)];
  for (let i = 0; i < puntos.length; i += 1) {
    if (acumuladas[i] > dDesde && acumuladas[i] < dHasta) tramo.push(puntos[i]);
  }
  tramo.push(puntoADistancia(puntos, acumuladas, dHasta));
  return tramo;
}

// Punto del recorrido en una fracción concreta (p.ej. la cabeza).
export function puntoEnFraccion(puntos, fraccion) {
  if (puntos.length === 0) return null;
  const acumuladas = distanciasAcumuladas(puntos);
  return puntoADistancia(puntos, acumuladas, fraccion * acumuladas[acumuladas.length - 1]);
}
