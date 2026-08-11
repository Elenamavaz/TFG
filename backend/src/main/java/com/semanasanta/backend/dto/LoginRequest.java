package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;

// Para Administrador y MiembroJuntaCofradia (los dos únicos roles con
// email+contraseña). El Cofrade entra por CodigoAccesoLoginRequest.
public record LoginRequest(
        @NotBlank(message = "El email es obligatorio")
        String email,
        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
