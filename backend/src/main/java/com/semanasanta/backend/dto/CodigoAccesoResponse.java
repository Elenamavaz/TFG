package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.CodigoAcceso;

public record CodigoAccesoResponse(
        Long id,
        String codigo,
        String estado,
        Long cofradiaId
) {
    public static CodigoAccesoResponse from(CodigoAcceso codigoAcceso) {
        return new CodigoAccesoResponse(
                codigoAcceso.getId(),
                codigoAcceso.getCodigo(),
                codigoAcceso.getEstado().name(),
                codigoAcceso.getCofradia().getId()
        );
    }
}
