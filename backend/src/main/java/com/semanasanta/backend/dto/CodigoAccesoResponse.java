package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.CodigoAcceso;

import java.time.LocalDateTime;

public record CodigoAccesoResponse(
        Long id,
        String codigo,
        String estado,
        Long cofradiaId,
        LocalDateTime fechaEmision,
        LocalDateTime fechaExpiracion,
        boolean caducado
) {
    public static CodigoAccesoResponse from(CodigoAcceso codigoAcceso) {
        return new CodigoAccesoResponse(
                codigoAcceso.getId(),
                codigoAcceso.getCodigo(),
                codigoAcceso.getEstado().name(),
                codigoAcceso.getCofradia().getId(),
                codigoAcceso.getFechaEmision(),
                codigoAcceso.getFechaExpiracion(),
                codigoAcceso.isCaducado()
        );
    }
}
