package com.semanasanta.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// "password" en texto plano: el Service la hashea con BCrypt antes de
// guardarla, nunca se persiste tal cual.
public record MiembroJuntaCofradiaRequest(
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String email,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        String password,
        @NotNull(message = "juntaCofradiasId es obligatorio")
        Long juntaCofradiasId
) {
}
