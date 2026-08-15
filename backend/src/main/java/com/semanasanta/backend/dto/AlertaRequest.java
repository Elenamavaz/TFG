package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Prioridad;
import com.semanasanta.backend.model.TipoAlerta;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AlertaRequest(
        @NotBlank(message = "El título de la notificación es obligatorio")
        String titulo,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId,
        @NotNull(message = "El tipo de alerta es obligatorio")
        TipoAlerta tipoAlerta,
        @NotNull(message = "La prioridad es obligatoria")
        Prioridad prioridad
) {
}
