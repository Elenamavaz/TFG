package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotNull;

// Un ping anónimo de ubicación (Sección AuthService: quien lo manda demuestra
// con su JWT que validó un código de acceso de la cofradía de esta procesión,
// pero no queda ningún registro de quién es).
public record PosicionActualRequest(
        @NotNull(message = "La latitud es obligatoria")
        Double latitud,
        @NotNull(message = "La longitud es obligatoria")
        Double longitud
) {
}
