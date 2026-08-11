package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.PuntoRuta;

import java.time.LocalDateTime;

public record PuntoRutaResponse(
        Long id,
        String tipo,
        Long ubicacionId,
        LocalDateTime horaPrevista,
        Integer orden,
        Long recorridoId
) {
    public static PuntoRutaResponse from(PuntoRuta puntoRuta) {
        return new PuntoRutaResponse(
                puntoRuta.getId(),
                puntoRuta.getTipo().name(),
                puntoRuta.getUbicacion().getId(),
                puntoRuta.getHoraPrevista(),
                puntoRuta.getOrden(),
                puntoRuta.getRecorrido().getId()
        );
    }
}
