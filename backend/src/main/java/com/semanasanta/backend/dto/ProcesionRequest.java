package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.EstadoEvento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

// "estado" (2026-09-30) es opcional y solo cuenta al actualizar: al crear,
// toda procesión nace PROGRAMADO igual que cualquier evento. null = no
// cambiarlo. CANCELADO también se admite (2026-10-02) pero sin avisar: el
// aviso con motivo y prioridad es POST /procesiones/{id}/cancelar, que la
// app ofrece justo después ("Crear Notificación"). recorridoId es opcional:
// puede programarse una procesión sin ruta definida todavía. pasosIds es opcional (una procesión puede crearse sin
// pasos asignados todavía y añadirlos después). cofradiaIds (no cofradiaId,
// decisión del 2026-08-11): una procesión puede tener más de una cofradía
// participando, al menos una es obligatoria. ubicacionId, a diferencia de
// EventoRequest, es opcional -decisión de Elena (2026-08-20): una procesión
// no tiene un único punto fijo, tiene un recorrido (ver migración V32).
public record ProcesionRequest(
        @NotBlank(message = "El nombre de la procesión es obligatorio")
        String nombre,
        String historia,
        String tradicion,
        @NotNull(message = "La fecha es obligatoria")
        LocalDateTime fecha,
        @NotEmpty(message = "Al menos una cofradía debe participar en la procesión")
        List<Long> cofradiaIds,
        Long ubicacionId,
        String web,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Long recorridoId,
        List<Long> pasosIds,
        EstadoEvento estado
) {
}
