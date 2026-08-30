package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Cuerpo de POST /dispositivos-push (público, ver SecurityConfig -el
// Ciudadano nunca se autentica). El cliente lo manda cada vez que resuelve
// qué ciudad mostrar (guardada o por GPS, ver arranqueCiudadano.js) y cuando
// el Ciudadano cambia de ciudad a mano.
public record DispositivoPushRequest(
        @NotBlank(message = "El token de push es obligatorio")
        String token,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId
) {
}
