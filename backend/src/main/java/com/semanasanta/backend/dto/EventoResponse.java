package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Evento;

import java.time.LocalDateTime;

public record EventoResponse(
        Long id,
        String nombre,
        String historia,
        String tradicion,
        LocalDateTime fecha,
        String estado,
        Long cofradiaId,
        Long ubicacionId
) {
    public static EventoResponse from(Evento evento) {
        return new EventoResponse(
                evento.getId(),
                evento.getNombre(),
                evento.getHistoria(),
                evento.getTradicion(),
                evento.getFecha(),
                evento.getEstado().name(),
                evento.getCofradia().getId(),
                evento.getUbicacion().getId()
        );
    }
}
