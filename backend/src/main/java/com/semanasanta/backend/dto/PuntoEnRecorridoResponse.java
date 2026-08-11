package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.RecorridoPuntoRuta;

import java.time.LocalDateTime;

public record PuntoEnRecorridoResponse(
        Long id,
        Long recorridoId,
        Integer orden,
        LocalDateTime horaPrevista,
        PuntoRutaResponse puntoRuta
) {
    public static PuntoEnRecorridoResponse from(RecorridoPuntoRuta relacion) {
        return new PuntoEnRecorridoResponse(
                relacion.getId(),
                relacion.getRecorrido().getId(),
                relacion.getOrden(),
                relacion.getHoraPrevista(),
                PuntoRutaResponse.from(relacion.getPuntoRuta())
        );
    }
}
