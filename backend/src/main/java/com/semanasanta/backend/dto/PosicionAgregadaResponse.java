package com.semanasanta.backend.dto;

// "Dónde está la procesión ahora mismo": promedio de los pings anónimos
// recibidos en los últimos ~60s. cofradesActivos es una aproximación (nº de
// pings recientes, no de personas distintas -no se registra identidad-).
public record PosicionAgregadaResponse(
        Double latitud,
        Double longitud,
        int cofradesActivos
) {
}
