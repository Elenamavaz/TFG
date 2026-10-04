package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.model.PuntoRuta;
import org.hibernate.Hibernate;

// Vista unificada de PuntoRuta y su subtipo PuntoDeInteres: tipo/nombre/
// descripcion/imagen quedan a null cuando el punto es "de paso" simple
// (instancia base PuntoRuta, no PuntoDeInteres). Sin orden/horaPrevista ni
// recorridoId: eso ya no es del punto, es de la relación con cada recorrido
// (ver PuntoEnRecorridoResponse).
//
// latitud/longitud (2026-10-03, para el mapa en vivo): copiadas de la
// Ubicacion del punto, para que el cliente pueda dibujar el recorrido con
// una sola petición -con solo ubicacionId haría falta una petición por
// punto, y un GPX trae cientos.
public record PuntoRutaResponse(
        Long id,
        String tipo,
        String nombre,
        String descripcion,
        String imagen,
        Long ubicacionId,
        Double latitud,
        Double longitud
) {
    public static PuntoRutaResponse from(PuntoRuta puntoRutaEntidad) {
        // El único llamador real (PuntoEnRecorridoResponse.from) llega aquí
        // desde RecorridoPuntoRuta.puntoRuta, una asociación LAZY: con
        // herencia JOINED sin columna discriminadora, Hibernate no sabe el
        // subtipo concreto sin ir a la base de datos, así que da un proxy de
        // la clase base PuntoRuta. instanceof PuntoDeInteres fallaría contra
        // ese proxy sin desenvolverlo antes -mismo bug ya corregido en
        // NotificacionResponse el 2026-08-14 (allí desapareció al quitar
        // NotificacionEntregada; aquí sigue haciendo falta el arreglo
        // explícito porque la asociación LAZY se queda).
        PuntoRuta puntoRuta = (PuntoRuta) Hibernate.unproxy(puntoRutaEntidad);
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
        var ubicacion = puntoRuta.getUbicacion();
        return new PuntoRutaResponse(
                puntoRuta.getId(),
                tipo,
                nombre,
                descripcion,
                imagen,
                ubicacion.getId(),
                ubicacion.getLatitud(),
                ubicacion.getLongitud()
        );
    }
}
