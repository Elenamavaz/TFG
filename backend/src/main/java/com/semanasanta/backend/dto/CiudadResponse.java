package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Ciudad;

// Cuerpo de salida al devolver una Ciudad (GET/POST/PUT).
public record CiudadResponse(
        Long id,
        String nombre,
        String comunidadAutonoma,
        String descripcion
) {
    public static CiudadResponse from(Ciudad ciudad) {
        return new CiudadResponse(
                ciudad.getId(),
                ciudad.getNombre(),
                ciudad.getComunidadAutonoma(),
                ciudad.getDescripcion()
        );
    }
}
