package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotNull;

// Sin "codigo": lo genera el servidor (aleatorio), el cliente no puede elegir
// el código que se emite.
public record CodigoAccesoRequest(
        @NotNull(message = "cofradiaId es obligatorio")
        Long cofradiaId
) {
}
