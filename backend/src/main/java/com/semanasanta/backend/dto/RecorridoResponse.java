package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Recorrido;

public record RecorridoResponse(
        Long id,
        Double distanciaTotal,
        Integer tiempoEstimado
) {
    public static RecorridoResponse from(Recorrido recorrido) {
        return new RecorridoResponse(
                recorrido.getId(),
                recorrido.getDistanciaTotal(),
                recorrido.getTiempoEstimado()
        );
    }
}
