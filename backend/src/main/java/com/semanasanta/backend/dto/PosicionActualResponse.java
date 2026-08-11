package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.PosicionActual;

import java.time.LocalDateTime;

public record PosicionActualResponse(
        Long id,
        Double latitud,
        Double longitud,
        LocalDateTime timestamp,
        Integer cofradesActivos,
        Long procesionId
) {
    public static PosicionActualResponse from(PosicionActual posicionActual) {
        return new PosicionActualResponse(
                posicionActual.getId(),
                posicionActual.getLatitud(),
                posicionActual.getLongitud(),
                posicionActual.getTimestamp(),
                posicionActual.getCofradesActivos(),
                posicionActual.getProcesion().getId()
        );
    }
}
