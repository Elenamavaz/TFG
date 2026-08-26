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

    // ruta debe venir ORDENADA (mismo orden que RecorridoPuntoRuta.orden).
    // Con menos de 2 puntos no hay ningún tramo que proyectar: se devuelve
    // una proyección "nula" (distancia 0, progreso 0), y quien llama decide
    // qué hacer (normalmente: no filtrar).
    public static Proyeccion proyectar(List<PuntoGeo> ruta, double latitud, double longitud) {
        if (ruta.size() < 2) {
            return new Proyeccion(0.0, 0.0);
        }

        double acumulado = 0.0;
        double mejorDistancia = Double.MAX_VALUE;
        double mejorProgreso = 0.0;

        for (int i = 0; i < ruta.size() - 1; i++) {
            PuntoGeo a = ruta.get(i);
            PuntoGeo b = ruta.get(i + 1);
            double largoTramo = distanciaMetros(a.latitud(), a.longitud(), b.latitud(), b.longitud());

            double t = proyeccionEnTramo(a, b, latitud, longitud);
            double proyeccionLat = a.latitud() + t * (b.latitud() - a.latitud());
            double proyeccionLon = a.longitud() + t * (b.longitud() - a.longitud());
            double distanciaAlTramo = distanciaMetros(latitud, longitud, proyeccionLat, proyeccionLon);

            if (distanciaAlTramo < mejorDistancia) {
                mejorDistancia = distanciaAlTramo;
                mejorProgreso = acumulado + t * largoTramo;
            }
            acumulado += largoTramo;
        }

        double longitudTotal = acumulado;
        double progresoFraccion = longitudTotal > 0 ? mejorProgreso / longitudTotal : 0.0;
        return new Proyeccion(mejorDistancia, Math.max(0.0, Math.min(1.0, progresoFraccion)));
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
