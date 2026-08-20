package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Prioridad;
import jakarta.validation.constraints.NotNull;

// Cuerpo de POST /procesiones/{id}/cancelar (2026-08-20, ver
// ProcesionService.cancelar): además de cambiar el estado, genera la
// Notificacion CANCELACION que informa al ciudadano -antes de esto, cancelar
// no avisaba a nadie. mensaje es opcional (la razón, si la Junta quiere
// escribirla); titulo lo genera el propio Service a partir del nombre de la
// procesión, no hace falta pedirlo aquí.
public record CancelarProcesionRequest(
        String mensaje,
        @NotNull(message = "La prioridad es obligatoria")
        Prioridad prioridad
) {
}
