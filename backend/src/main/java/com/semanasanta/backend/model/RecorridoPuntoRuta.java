package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla intermedia N:M entre Recorrido y PuntoRuta:
// un mismo PuntoRuta puede formar parte de varios recorridos -varias
// procesiones pueden compartir tramo-, así que "en qué orden" y "a qué hora
// prevista" pasan a ser atributos de ESTA relación, no del punto en sí.
@Entity
@Table(name = "recorrido_puntos_ruta")
public class RecorridoPuntoRuta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorrido_id", nullable = false)
    private Recorrido recorrido;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "punto_ruta_id", nullable = false)
    private PuntoRuta puntoRuta;

    // Posición del punto dentro de ESTE recorrido (0, 1, 2...), no del punto.
    @Column(nullable = false)
    private Integer orden;

    @Column(name = "hora_prevista")
    private LocalDateTime horaPrevista;

    protected RecorridoPuntoRuta() {
    }

    public RecorridoPuntoRuta(Recorrido recorrido, PuntoRuta puntoRuta, Integer orden, LocalDateTime horaPrevista) {
        this.recorrido = recorrido;
        this.puntoRuta = puntoRuta;
        this.orden = orden;
        this.horaPrevista = horaPrevista;
    }

    public Long getId() {
        return id;
    }

    public Recorrido getRecorrido() {
        return recorrido;
    }

    public PuntoRuta getPuntoRuta() {
        return puntoRuta;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public LocalDateTime getHoraPrevista() {
        return horaPrevista;
    }

    public void setHoraPrevista(LocalDateTime horaPrevista) {
        this.horaPrevista = horaPrevista;
    }
}
