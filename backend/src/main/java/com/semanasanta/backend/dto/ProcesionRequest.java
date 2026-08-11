package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

// Sin "estado": lo hereda de Evento y nace PROGRAMADO igual que cualquier
// evento. recorridoId es opcional: puede programarse una procesión sin ruta
// definida todavía. pasosIds es opcional (una procesión puede crearse sin
// pasos asignados todavía y añadirlos después).
public record ProcesionRequest(
        @NotBlank(message = "El nombre de la procesión es obligatorio")
        String nombre,
        String historia,
        String tradicion,
        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime fecha,
        @NotNull(message = "cofradiaId es obligatorio")
        Long cofradiaId,
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Long recorridoId,
        List<Long> pasosIds
) {
}
