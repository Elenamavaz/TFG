package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.7.1 del Apéndice C: posicion_actual (renombrada posiciones_actuales).
// Decisión del 2026-08-10: histórico de posiciones de una procesión (una fila
// por cada lectura agregada, no una fila que se sobrescribe). "Posición
// actual" = la fila más reciente de una procesión (ver PosicionActualService).
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

    @Column(name = "cofrades_activos")
    private Integer cofradesActivos;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "procesion_id", nullable = false)
    private Procesion procesion;

    protected PosicionActual() {
    }

    public PosicionActual(Double latitud, Double longitud, Integer cofradesActivos, Procesion procesion) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.cofradesActivos = cofradesActivos;
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

    public Integer getCofradesActivos() {
        return cofradesActivos;
    }

    public Procesion getProcesion() {
        return procesion;
    }
}
