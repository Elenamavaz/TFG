package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.TipoPuntoInteres;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Sin recorridoId/orden/horaPrevista: eso se hace aparte, enganchando el
// punto ya creado a uno o varios recorridos (POST /recorridos/{id}/puntos-ruta).
public record PuntoDeInteresRequest(
        @NotNull(message = "El tipo de punto de interés es obligatorio")
        TipoPuntoInteres tipo,
        @NotBlank(message = "El nombre del punto de interés es obligatorio")
        String nombre,
        String descripcion,
        String imagen,
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId
) {
}
