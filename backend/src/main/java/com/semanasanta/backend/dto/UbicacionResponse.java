package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Ubicacion;

public record UbicacionResponse(
        Long id,
        Double latitud,
        Double longitud,
        String direccion
) {
    public static UbicacionResponse from(Ubicacion ubicacion) {
        return new UbicacionResponse(
                ubicacion.getId(),
                ubicacion.getLatitud(),
                ubicacion.getLongitud(),
                ubicacion.getDireccion()
        );
    }
}
