package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

// Sin "estado": todo Evento nace PROGRAMADO, lo fija el servidor
// (ver Evento.java). Cambiar el estado será un endpoint propio, no este DTO.
// cofradiaIds (no cofradiaId): un evento puede tener más de una cofradía
// participando (decisión del 2026-08-11), al menos una es obligatoria.
// pasosIds es opcional (2026-08-23, mismo patrón que ProcesionRequest: un
// evento puede crearse sin pasos asignados todavía y añadirlos después).
public record EventoRequest(
        @NotBlank(message = "El nombre del evento es obligatorio")
        String nombre,
        String historia,
        String tradicion,
        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime fecha,
        @NotEmpty(message = "Al menos una cofradía debe participar en el evento")
        List<Long> cofradiaIds,
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId,
        String web,
        List<Long> pasosIds
) {
}
