package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.8.1 del Apéndice C: puntos_ruta.
// "Puntos que componen el recorrido. Puede ser de tipo UBICACION o
// PUNTO_DE_INTERES" (RI-06).
// ubicacion (relación) en vez de latitud/longitud/direccion propias: hueco
// detectado el 2026-08-10, no está así en el Apéndice C del PDF.
@Entity
@Table(name = "puntos_ruta")
public class PuntoRuta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPuntoRuta tipo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private Ubicacion ubicacion;

    @Column(name = "hora_prevista")
    private LocalDateTime horaPrevista;

    // Posición del punto dentro del recorrido (0, 1, 2...); determina el orden
    // en que se recorren, no es un id.
    @Column(nullable = false)
    private Integer orden;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorrido_id", nullable = false)
    private Recorrido recorrido;

    protected PuntoRuta() {
    }

    public PuntoRuta(TipoPuntoRuta tipo, Ubicacion ubicacion, LocalDateTime horaPrevista,
                      Integer orden, Recorrido recorrido) {
        this.tipo = tipo;
        this.ubicacion = ubicacion;
        this.horaPrevista = horaPrevista;
        this.orden = orden;
        this.recorrido = recorrido;
    }

    public Long getId() {
        return id;
    }

    public TipoPuntoRuta getTipo() {
        return tipo;
    }

    public void setTipo(TipoPuntoRuta tipo) {
        this.tipo = tipo;
    }

    public Ubicacion getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(Ubicacion ubicacion) {
        this.ubicacion = ubicacion;
    }

    public LocalDateTime getHoraPrevista() {
        return horaPrevista;
    }

    public void setHoraPrevista(LocalDateTime horaPrevista) {
        this.horaPrevista = horaPrevista;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Recorrido getRecorrido() {
        return recorrido;
    }

    public void setRecorrido(Recorrido recorrido) {
        this.recorrido = recorrido;
    }
}
