package com.semanasanta.backend.model;

// Tabla C.10 del Apéndice C: valores posibles de notificaciones.prioridad.
// URGENTE quitado el 2026-08-22 (a petición de Elena, ver V35): en la
// práctica ya era indistinguible de ALTA -Notificacion.colorCategoria del
// cliente los pintaba con el mismo rojo desde siempre-, así que no se estaba
// ganando su sitio como cuarto nivel. Con tres queda completo: BAJA/MEDIA/ALTA.
public enum Prioridad {
    BAJA,
    MEDIA,
    ALTA
}
