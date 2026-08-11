package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Paso;

public record PasoResponse(
        Long id,
        String nombre,
        String historia,
        String analisisArtistico,
        String imagen,
        Long cofradiaId
) {
    public static PasoResponse from(Paso paso) {
        return new PasoResponse(
                paso.getId(),
                paso.getNombre(),
                paso.getHistoria(),
                paso.getAnalisisArtistico(),
                paso.getImagen(),
                paso.getCofradia().getId()
        );
    }
}
