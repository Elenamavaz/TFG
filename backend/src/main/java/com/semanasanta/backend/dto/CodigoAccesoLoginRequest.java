package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record CodigoAccesoLoginRequest(
        @NotBlank(message = "El código es obligatorio")
        String codigo
) {
}
