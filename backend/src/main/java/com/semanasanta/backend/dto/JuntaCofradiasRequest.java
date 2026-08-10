package com.semanasanta.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record JuntaCofradiasRequest(
        @NotBlank(message = "El nombre de la Junta es obligatorio")
        String nombre,
        @Email(message = "El email no tiene un formato válido")
        String email,
        String telefono,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId
) {
}
