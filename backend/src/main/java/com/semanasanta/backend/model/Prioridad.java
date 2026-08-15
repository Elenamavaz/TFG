package com.semanasanta.backend.model;

// Tabla C.10 del Apéndice C: valores posibles de notificaciones.prioridad
// (solo aplica cuando la notificación es una Alerta, no un Aviso).
public enum Prioridad {
    BAJA,
    MEDIA,
    ALTA,
    URGENTE
}
