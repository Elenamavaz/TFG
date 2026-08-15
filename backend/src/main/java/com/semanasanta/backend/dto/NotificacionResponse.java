package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Alerta;
import com.semanasanta.backend.model.Aviso;
import com.semanasanta.backend.model.Notificacion;

import java.time.LocalDateTime;

// Vista unificada de Notificacion y sus subtipos Aviso/Alerta (mismo patrón
// que PuntoRutaResponse con PuntoRuta/PuntoDeInteres): los campos que no
// aplican al subtipo concreto quedan a null.
public record NotificacionResponse(
        Long id,
        String tipo,
        String titulo,
        LocalDateTime fechaCreacion,
        Long ciudadId,
        LocalDateTime fechaExpiracion,
        String tipoAlerta,
        String prioridad
) {
    public static NotificacionResponse from(Notificacion notificacion) {
        String tipo;
        LocalDateTime fechaExpiracion = null;
        String tipoAlerta = null;
        String prioridad = null;
        if (notificacion instanceof Aviso aviso) {
            tipo = "AVISO";
            fechaExpiracion = aviso.getFechaExpiracion();
        } else if (notificacion instanceof Alerta alerta) {
            tipo = "ALERTA";
            tipoAlerta = alerta.getTipoAlerta().name();
            prioridad = alerta.getPrioridad().name();
        } else {
            // No debería llegar a pasar: Notificacion es abstracta, solo
            // existen instancias de sus dos subtipos.
            throw new IllegalStateException("Tipo de notificación desconocido: " + notificacion.getClass());
        }
        return new NotificacionResponse(
                notificacion.getId(),
                tipo,
                notificacion.getTitulo(),
                notificacion.getFechaCreacion(),
                notificacion.getCiudad().getId(),
                fechaExpiracion,
                tipoAlerta,
                prioridad
        );
    }
}
