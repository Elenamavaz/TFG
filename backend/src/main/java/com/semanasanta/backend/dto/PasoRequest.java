package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PasoRequest(
        @NotBlank(message = "El nombre del paso es obligatorio")
        String nombre,
        String historia,
        String analisisArtistico,
        String imagen,
        @NotNull(message = "cofradiaId es obligatorio")
        Long cofradiaId
) {
}
