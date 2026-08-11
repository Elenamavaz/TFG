package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.model.Recorrido;

import java.time.LocalDateTime;
import java.util.List;

public record ProcesionResponse(
        Long id,
        String nombre,
        String historia,
        String tradicion,
        LocalDateTime fecha,
        String estado,
        List<Long> cofradiaIds,
        Long ubicacionId,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Long recorridoId,
        List<Long> pasosIds
) {
    public static ProcesionResponse from(Procesion procesion) {
        Recorrido recorrido = procesion.getRecorrido();
        return new ProcesionResponse(
                procesion.getId(),
                procesion.getNombre(),
                procesion.getHistoria(),
                procesion.getTradicion(),
                procesion.getFecha(),
                procesion.getEstado().name(),
                procesion.getCofradias().stream().map(cofradia -> cofradia.getId()).toList(),
                procesion.getUbicacion().getId(),
                procesion.getFechaInicio(),
                procesion.getFechaFin(),
                recorrido != null ? recorrido.getId() : null,
                procesion.getPasos().stream().map(paso -> paso.getId()).toList()
        );
    }
}
