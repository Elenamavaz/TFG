package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.model.PuntoRuta;

// Vista unificada de PuntoRuta y su subtipo PuntoDeInteres: tipo/nombre/
// descripcion/imagen quedan a null cuando el punto es "de paso" simple
// (instancia base PuntoRuta, no PuntoDeInteres). Sin orden/horaPrevista ni
// recorridoId: eso ya no es del punto, es de la relación con cada recorrido
// (ver PuntoEnRecorridoResponse).
public record PuntoRutaResponse(
        Long id,
        String tipo,
        String nombre,
        String descripcion,
        String imagen,
        Long ubicacionId
) {
    public static PuntoRutaResponse from(PuntoRuta puntoRuta) {
        String tipo = null;
        String nombre = null;
        String descripcion = null;
        String imagen = null;
        if (puntoRuta instanceof PuntoDeInteres puntoDeInteres) {
            tipo = puntoDeInteres.getTipo().name();
            nombre = puntoDeInteres.getNombre();
            descripcion = puntoDeInteres.getDescripcion();
            imagen = puntoDeInteres.getImagen();
        }
        return new PuntoRutaResponse(
                puntoRuta.getId(),
                tipo,
                nombre,
                descripcion,
                imagen,
                puntoRuta.getUbicacion().getId()
        );
    }
}
