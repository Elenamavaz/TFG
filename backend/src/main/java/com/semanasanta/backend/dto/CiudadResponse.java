package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Ciudad;

// Cuerpo de salida al devolver una Ciudad (GET/POST/PUT).
public record CiudadResponse(
        Long id,
        String nombre,
        String comunidadAutonoma,
        String provincia,
        String historia,
        String patrimonio,
        boolean activa,
        Double latitud,
        Double longitud
) {
    public static CiudadResponse from(Ciudad ciudad) {
        return new CiudadResponse(
                ciudad.getId(),
                ciudad.getNombre(),
                ciudad.getComunidadAutonoma(),
                ciudad.getProvincia(),
                ciudad.getHistoria(),
                ciudad.getPatrimonio(),
                ciudad.isActiva(),
                ciudad.getLatitud(),
                ciudad.getLongitud()
        );
    }
}
