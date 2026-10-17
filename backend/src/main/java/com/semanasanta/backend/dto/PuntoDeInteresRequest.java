package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.TipoPuntoInteres;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Sin recorridoId/orden/horaPrevista: eso se hace aparte, enganchando el
// punto ya creado a uno o varios recorridos (POST /recorridos/{id}/puntos-ruta).
public record PuntoDeInteresRequest(
        @NotNull(message = "El tipo de punto de interés es obligatorio")
        TipoPuntoInteres tipo,
        @NotBlank(message = "El nombre del punto de interés es obligatorio")
        String nombre,
        String descripcion,
        // Enlace a una imagen ya publicada (no se suben archivos): http(s) y
        // como mucho 500 caracteres, el tamaño de la columna. Sin esto, una URL
        // larga reventaba en la base de datos con un error sin sentido.
        @Size(max = 500, message = "El enlace de la imagen es demasiado largo (máximo 500 caracteres)")
        @Pattern(regexp = "^https?://\\S+$", message = "El enlace de la imagen debe empezar por http:// o https://")
        String imagen,
        @NotNull(message = "ubicacionId es obligatorio")
        Long ubicacionId
) {
}
