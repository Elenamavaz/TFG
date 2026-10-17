package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.TipoPuntoInteres;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Cuerpo de PUT /recorridos/{id}/puntos-ruta/{relacionId}/punto-de-interes
// (2026-08-23): "convierte" un punto de paso simple, ya importado del GPX,
// en un PuntoDeInteres -un encuentro, una entrada a una iglesia, una parada
// para una lectura u oración... Sin ubicacionId aquí, a diferencia de
// PuntoDeInteresRequest: se reutiliza la Ubicacion que ya tenía el punto de
// paso (ver RecorridoPuntoRutaService.marcarComoPuntoDeInteres), no tiene
// sentido pedir una nueva si el punto ya está en el sitio correcto del mapa.
public record MarcarPuntoDeInteresRequest(
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
        String imagen
) {
}
