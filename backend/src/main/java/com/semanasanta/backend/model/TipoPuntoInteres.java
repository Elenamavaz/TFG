package com.semanasanta.backend.model;

// Enum TipoPuntoInteres del diagrama de dominio (Figura 3.5): categoría de un
// PuntoDeInteres. Renombrado el 2026-08-10 desde TipoPuntoRuta para que
// coincida con el diagrama (es un tipo de PuntoDeInteres, no de PuntoRuta).
public enum TipoPuntoInteres {
    MONUMENTO,
    IGLESIA,
    ENCUENTRO,
    ORACCION,
    ENTRADAPROCESION,
    SALIDAPROCESION,
    UBICACIONEVENTO
}
