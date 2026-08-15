package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AvisoRequest(
        @NotBlank(message = "El título de la notificación es obligatorio")
        String titulo,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId,
        // Opcional: un aviso puede no caducar nunca.
        LocalDateTime fechaExpiracion
) {
}
