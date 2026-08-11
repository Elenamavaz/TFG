package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotNull;

// procesionId no está aquí: viene de la URL (POST /procesiones/{id}/posiciones),
// no tiene sentido que el body pueda "mentir" sobre a qué procesión pertenece.
public record PosicionActualRequest(
        @NotNull(message = "La latitud es obligatoria")
        Double latitud,
        @NotNull(message = "La longitud es obligatoria")
        Double longitud,
        Integer cofradesActivos
) {
}
