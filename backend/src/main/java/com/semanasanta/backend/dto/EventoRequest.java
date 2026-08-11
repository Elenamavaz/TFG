package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

// Sin "estado": todo Evento nace PROGRAMADO, lo fija el servidor
// (ver Evento.java). Cambiar el estado será un endpoint propio, no este DTO.
public record EventoRequest(
        @NotBlank(message = "El nombre del evento es obligatorio")
        String nombre,
        String historia,
        String tradicion,
        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime fecha,
        @NotNull(message = "cofradiaId es obligatorio")
        Long cofradiaId,
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId
) {
}
