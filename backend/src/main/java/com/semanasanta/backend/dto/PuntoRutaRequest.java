package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.TipoPuntoRuta;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record PuntoRutaRequest(
        @NotNull(message = "El tipo de punto es obligatorio")
        TipoPuntoRuta tipo,
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId,
        LocalDateTime horaPrevista,
        @NotNull(message = "El orden dentro del recorrido es obligatorio")
        Integer orden,
        @NotNull(message = "recorridoId es obligatorio")
        Long recorridoId
) {
}
