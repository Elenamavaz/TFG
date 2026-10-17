package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PasoRequest(
        @NotBlank(message = "El nombre del paso es obligatorio")
        String nombre,
        String historia,
        String analisisArtistico,
        // Enlace a una imagen ya publicada (no se suben archivos): http(s) y
        // como mucho 500 caracteres, el tamaño de la columna. Sin esto, una URL
        // larga reventaba en la base de datos con un error sin sentido.
        @Size(max = 500, message = "El enlace de la imagen es demasiado largo (máximo 500 caracteres)")
        @Pattern(regexp = "^https?://\\S+$", message = "El enlace de la imagen debe empezar por http:// o https://")
        String imagen,
        @NotNull(message = "cofradiaId es obligatorio")
        Long cofradiaId
) {
}
