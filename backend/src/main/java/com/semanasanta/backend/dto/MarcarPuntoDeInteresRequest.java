package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.TipoPuntoInteres;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
        String imagen
) {
}
