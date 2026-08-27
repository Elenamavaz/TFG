package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// "activa" se ignora al crear (una cofradía nueva siempre nace activa, ver
// Cofradia) y solo se aplica al editar -mismo patrón que CiudadRequest.
public record CofradiaRequest(
        @NotBlank(message = "El nombre de la cofradía es obligatorio")
        String nombre,
        String historia,
        String web,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId,
        boolean activa
) {
}
