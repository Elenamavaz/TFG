package com.semanasanta.backend.util;

import java.util.List;

// Cálculos geométricos de un punto GPS suelto contra un recorrido (polilínea
// de puntos ordenados). Se usa para dos cosas (2026-08-22, a petición de
// Elena):
//   1. Filtrar pings que caen fuera del recorrido marcado (no se guardan).
//   2. Calcular cuánto ha "avanzado" un ping a lo largo del recorrido, para
//      pintar la estela en vivo de la procesión (ver
//      PosicionActualService.estela).
// Utilidad estática sin estado, mismo estilo que GpxParser.
public final class GeometriaRuta {

    private static final double RADIO_TIERRA_METROS = 6371000.0;
    private static final double METROS_POR_GRADO_LAT = 111320.0;

    private GeometriaRuta() {
    }

    public record PuntoGeo(double latitud, double longitud) {
    }

    // distanciaMetros: distancia perpendicular del punto al tramo más
    // cercano del recorrido -para el filtro de "fuera de ruta".
    // progreso: fracción (0..1) de la longitud total del recorrido recorrida
    // hasta el punto de proyección más cercano -para la estela en vivo.
    public record Proyeccion(double distanciaMetros, double progreso) {
    }

    // Margen para considerar "igual de cerca" dos tramos distintos del
    // recorrido: del orden del error de un GPS de móvil en la calle.
    private static final double TOLERANCIA_AMBIGUEDAD_METROS = 30.0;
    // Dos tramos a menos de esto A LO LARGO del recorrido son el mismo sitio
    // de la ruta (p.ej. tramos consecutivos de un GPX con puntos muy
    // seguidos), no una ambigüedad real: no se desempatan por la referencia.
    private static final double SEPARACION_MISMO_SITIO_METROS = 100.0;

    // ruta debe venir ORDENADA (mismo orden que RecorridoPuntoRuta.orden).
    // Con menos de 2 puntos no hay ningún tramo que proyectar: se devuelve
    // una proyección "nula" (distancia 0, progreso 0), y quien llama decide
    // qué hacer (normalmente: no filtrar).
    // Sin referencia de avance: el tramo más cercano, sin más.
    public static Proyeccion proyectar(List<PuntoGeo> ruta, double latitud, double longitud) {
        return proyectar(ruta, latitud, longitud, 0.0, 1.0);
    }

    // Con referencia de avance [progresoMin, progresoMax] (fracciones 0..1,
    // normalmente lo ya recorrido por la procesión). Arregla los recorridos
    // circulares -casi todas las procesiones vuelven a su templo, así que
    // salida y llegada son el mismo punto- y los que se cruzan consigo
    // mismos (bug 7 de bugs.md, 2026-10-16): un ping junto al templo está
    // igual de cerca del primer tramo que del último, y "el más cercano" a
    // secas podía darle progreso 1.0 al salir, con lo que la estela quedaba
    // pintada entera desde el primer minuto. Ahora, entre los tramos casi
    // igual de cercanos (TOLERANCIA_AMBIGUEDAD_METROS), gana el que cae
    // dentro de la referencia o más cerca de ella. Con [0, 1] todos caen
    // dentro y se queda el más cercano (mismo resultado que sin referencia).
    public static Proyeccion proyectar(List<PuntoGeo> ruta, double latitud, double longitud,
                                       double progresoMin, double progresoMax) {
        if (ruta.size() < 2) {
            return new Proyeccion(0.0, 0.0);
        }

        int tramos = ruta.size() - 1;
        double[] distancias = new double[tramos];
        double[] avances = new double[tramos]; // metros desde el inicio hasta la proyección en cada tramo
        double acumulado = 0.0;
        double mejorDistancia = Double.MAX_VALUE;

        for (int i = 0; i < tramos; i++) {
            PuntoGeo a = ruta.get(i);
            PuntoGeo b = ruta.get(i + 1);
            double largoTramo = distanciaMetros(a.latitud(), a.longitud(), b.latitud(), b.longitud());

            double t = proyeccionEnTramo(a, b, latitud, longitud);
            double proyeccionLat = a.latitud() + t * (b.latitud() - a.latitud());
            double proyeccionLon = a.longitud() + t * (b.longitud() - a.longitud());
            distancias[i] = distanciaMetros(latitud, longitud, proyeccionLat, proyeccionLon);
            avances[i] = acumulado + t * largoTramo;
            mejorDistancia = Math.min(mejorDistancia, distancias[i]);
            acumulado += largoTramo;
        }

        double longitudTotal = acumulado;

        // 1) Entre los candidatos (casi igual de cerca que el más cercano),
        //    el que mejor encaja con la referencia de avance.
        int elegido = -1;
        double mejorAlejamiento = Double.MAX_VALUE;
        for (int i = 0; i < tramos; i++) {
            if (distancias[i] > mejorDistancia + TOLERANCIA_AMBIGUEDAD_METROS) {
                continue; // claramente más lejos que el tramo más cercano: no es candidato
            }
            double progreso = longitudTotal > 0 ? avances[i] / longitudTotal : 0.0;
            double alejamiento = Math.max(0.0, Math.max(progresoMin - progreso, progreso - progresoMax));
            boolean mejor = alejamiento < mejorAlejamiento
                    || (alejamiento == mejorAlejamiento && distancias[i] < distancias[elegido]);
            if (mejor) {
                elegido = i;
                mejorAlejamiento = alejamiento;
            }
        }

        // 2) Dentro de ese mismo sitio de la ruta, el tramo realmente más
        //    cercano: la referencia solo decide ENTRE sitios distintos, no
        //    debe arrastrar el resultado unos metros hacia ella.
        double avanceElegido = avances[elegido];
        for (int i = 0; i < tramos; i++) {
            boolean mismoSitio = Math.abs(avances[i] - avanceElegido) <= SEPARACION_MISMO_SITIO_METROS;
            if (mismoSitio && distancias[i] < distancias[elegido]) {
                elegido = i;
            }
        }

        double progresoFraccion = longitudTotal > 0 ? avances[elegido] / longitudTotal : 0.0;
        return new Proyeccion(distancias[elegido], Math.max(0.0, Math.min(1.0, progresoFraccion)));
    }

    // t en [0,1]: posición del punto más cercano a (latitud, longitud)
    // dentro del tramo A-B, tratando lat/lon como un plano local (válido a
    // la escala de calles de una ciudad; el propio tramo es corto). 0 =
    // pegado a A, 1 = pegado a B, clamp en los extremos para que el punto
    // más cercano no se salga del tramo cuando la proyección cae fuera de él.
    private static double proyeccionEnTramo(PuntoGeo a, PuntoGeo b, double latitud, double longitud) {
        double latRef = Math.toRadians((a.latitud() + b.latitud()) / 2);
        double metrosPorGradoLon = METROS_POR_GRADO_LAT * Math.cos(latRef);

        double bx = (b.longitud() - a.longitud()) * metrosPorGradoLon;
        double by = (b.latitud() - a.latitud()) * METROS_POR_GRADO_LAT;
        double px = (longitud - a.longitud()) * metrosPorGradoLon;
        double py = (latitud - a.latitud()) * METROS_POR_GRADO_LAT;

        double largoCuadrado = bx * bx + by * by;
        if (largoCuadrado == 0) {
            return 0.0; // tramo degenerado (A y B en el mismo sitio)
        }
        double t = (px * bx + py * by) / largoCuadrado;
        return Math.max(0.0, Math.min(1.0, t));
    }

    // Misma fórmula de Haversine que RecorridoService.distanciaTotalKm, pero
    // en metros -aquí se compara contra un umbral en metros, no se acumula
    // en km para mostrar en pantalla.
    private static double distanciaMetros(double lat1, double lon1, double lat2, double lon2) {
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);
        double haversine = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        return RADIO_TIERRA_METROS * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    }
}
