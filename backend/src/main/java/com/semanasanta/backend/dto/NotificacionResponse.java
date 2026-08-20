package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Notificacion;

import java.time.LocalDateTime;

// Sustituye a la versión con instanceof Aviso/Alerta (2026-08-20, ver
// Notificacion): ya no hay dos subtipos que distinguir, es una vista directa
// de la única clase. tipo/prioridad ya no son String -el cliente los recibe
// como el name() del enum, igual que antes, pero aquí no hace falta
// reconstruirlos a mano por subtipo.
public record NotificacionResponse(
        Long id,
        String titulo,
        String mensaje,
        LocalDateTime fechaCreacion,
        Long ciudadId,
        String tipo,
        String prioridad,
        LocalDateTime fechaExpiracion
) {
    public static NotificacionResponse from(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getId(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getFechaCreacion(),
                notificacion.getCiudad().getId(),
                notificacion.getTipo().name(),
                notificacion.getPrioridad() != null ? notificacion.getPrioridad().name() : null,
                notificacion.getFechaExpiracion()
        );
    }
}
