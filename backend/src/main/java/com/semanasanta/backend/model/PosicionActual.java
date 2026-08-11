package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.7.1 del Apéndice C: posicion_actual (renombrada posiciones_actuales).
// Decisión del 2026-08-11: cada fila es un PING ANÓNIMO -una lectura GPS
// suelta de "alguien" en la procesión, sin ligar a ninguna persona ni sesión
// (no se registra a quién comparte ubicación). La "posición actual" no es un
// campo guardado, se CALCULA leyendo los pings recientes (ver
// PosicionActualService.actual).
@Entity
@Table(name = "posiciones_actuales")
public class PosicionActual {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "procesion_id", nullable = false)
    private Procesion procesion;

    protected PosicionActual() {
    }

    public PosicionActual(Double latitud, Double longitud, Procesion procesion) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.procesion = procesion;
        this.timestamp = LocalDateTime.now(); // el instante de la lectura lo fija el servidor
    }

    public Long getId() {
        return id;
    }

    public Double getLatitud() {
        return latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public Procesion getProcesion() {
        return procesion;
    }
}
