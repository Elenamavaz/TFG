package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Cofradia;

import java.time.LocalDateTime;

public record CofradiaResponse(
        Long id,
        String nombre,
        String historia,
        String web,
        LocalDateTime fechaCreacion,
        Long ciudadId
) {
    public static CofradiaResponse from(Cofradia cofradia) {
        return new CofradiaResponse(
                cofradia.getId(),
                cofradia.getNombre(),
                cofradia.getHistoria(),
                cofradia.getWeb(),
                cofradia.getFechaCreacion(),
                cofradia.getCiudad().getId()
        );
    }
}
