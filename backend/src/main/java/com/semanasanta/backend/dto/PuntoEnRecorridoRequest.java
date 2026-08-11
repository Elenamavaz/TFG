package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

// Engancha un PuntoRuta (o PuntoDeInteres) ya existente a un recorrido, en
// una posición y hora concretas. recorridoId no está aquí: viene de la URL
// (POST /recorridos/{id}/puntos-ruta).
public record PuntoEnRecorridoRequest(
        @NotNull(message = "puntoRutaId es obligatorio")
        Long puntoRutaId,
        @NotNull(message = "El orden dentro del recorrido es obligatorio")
        Integer orden,
        LocalDateTime horaPrevista
) {
}
