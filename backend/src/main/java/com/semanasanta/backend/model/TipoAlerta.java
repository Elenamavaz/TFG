package com.semanasanta.backend.model;

// Tabla C.10 del Apéndice C: valores posibles de notificaciones.tipo_alerta
// (solo aplica cuando la notificación es una Alerta, no un Aviso).
public enum TipoAlerta {
    INCIDENCIA,
    CAMBIO_HORARIO,
    CANCELACION,
    CORTE_CALLE,
    METEOROLOGIA,
    SEGURIDAD
}
