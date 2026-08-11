package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.PosicionActual;

import java.time.LocalDateTime;

// Un ping individual (histórico). Para el valor calculado "posición actual
// de la procesión ahora mismo", ver PosicionAgregadaResponse.
public record PosicionActualResponse(
        Long id,
        Double latitud,
        Double longitud,
        LocalDateTime timestamp,
        Long procesionId
) {
    public static PosicionActualResponse from(PosicionActual posicionActual) {
        return new PosicionActualResponse(
                posicionActual.getId(),
                posicionActual.getLatitud(),
                posicionActual.getLongitud(),
                posicionActual.getTimestamp(),
                posicionActual.getProcesion().getId()
        );
    }
}
