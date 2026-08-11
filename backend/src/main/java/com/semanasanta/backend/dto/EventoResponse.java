package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Evento;

import java.time.LocalDateTime;
import java.util.List;

public record EventoResponse(
        Long id,
        String nombre,
        String historia,
        String tradicion,
        LocalDateTime fecha,
        String estado,
        List<Long> cofradiaIds,
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
                evento.getCofradias().stream().map(cofradia -> cofradia.getId()).toList(),
                evento.getUbicacion().getId()
        );
    }
}
