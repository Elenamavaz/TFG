package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotNull;

public record UbicacionRequest(
        @NotNull(message = "La latitud es obligatoria")
        Double latitud,
        @NotNull(message = "La longitud es obligatoria")
        Double longitud,
        String direccion
) {
}
