package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Prioridad;
import com.semanasanta.backend.model.TipoNotificacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

// Sustituye a AvisoRequest/AlertaRequest (2026-08-20, ver Notificacion): un
// único endpoint de creación para la Junta. mensaje y fechaExpiracion son
// opcionales para cualquier tipo. prioridad es opcional aquí a nivel de bean
// validation (no puede ser @NotNull condicional según tipo con anotaciones),
// pero NotificacionService.crear() la exige igualmente -- ver ahí. tipo no
// admite INICIO/FIN por esta vía (los genera el sistema, no la Junta),
// también comprobado en el Service.
public record NotificacionRequest(
        @NotBlank(message = "El título de la notificación es obligatorio")
        String titulo,
        String mensaje,
        @NotNull(message = "ciudadId es obligatorio")
        Long ciudadId,
        @NotNull(message = "El tipo de notificación es obligatorio")
        TipoNotificacion tipo,
        Prioridad prioridad,
        LocalDateTime fechaExpiracion
) {
}
