package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotNull;

// Crea un punto "de paso" simple (sin nombre/tipo), sin asociarlo todavía a
// ningún recorrido. Para un punto de interés con detalle, ver
// PuntoDeInteresRequest. Para engancharlo a un recorrido, ver
// PuntoEnRecorridoRequest / POST /recorridos/{id}/puntos-ruta.
public record PuntoRutaRequest(
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId
) {
}
