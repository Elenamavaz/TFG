package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CofradiaRequest(
        @NotBlank(message = "El nombre de la cofradía es obligatorio")
        String nombre,
        String historia,
        String web,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId
) {
}
