package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.6 del Apéndice C: eventos.
// "Acto organizado por una cofradía. Una procesión sigue a un evento" (RI-03).
//
// Raíz de una jerarquía de herencia real (estrategia JOINED): Procesion
// extiende esta clase y añade fechaInicio/fechaFin/recorrido/pasos/
// posicionActual en su propia tabla "procesiones", cuyo id es también FK a
// esta tabla. Decisión del 2026-08-10, no está así en el Apéndice C del PDF
// (que modelaba procesiones->eventos como FK 1:N, sin herencia); pendiente
// actualizar el texto de la memoria.
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String historia;

    @Column(columnDefinition = "TEXT")
    private String tradicion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoEvento estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cofradia_id", nullable = false)
    private Cofradia cofradia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private Ubicacion ubicacion;

    protected Evento() {
    }

    public Evento(String nombre, String historia, String tradicion, LocalDateTime fecha, Cofradia cofradia, Ubicacion ubicacion) {
        this.nombre = nombre;
        this.historia = historia;
        this.tradicion = tradicion;
        this.fecha = fecha;
        this.cofradia = cofradia;
        this.ubicacion = ubicacion;
        this.estado = EstadoEvento.PROGRAMADO; // todo evento (o procesión) nace PROGRAMADO
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getHistoria() {
        return historia;
    }

    public void setHistoria(String historia) {
        this.historia = historia;
    }

    public String getTradicion() {
        return tradicion;
    }

    public void setTradicion(String tradicion) {
        this.tradicion = tradicion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public EstadoEvento getEstado() {
        return estado;
    }

    public void setEstado(EstadoEvento estado) {
        this.estado = estado;
    }

    public Cofradia getCofradia() {
        return cofradia;
    }

    public void setCofradia(Cofradia cofradia) {
        this.cofradia = cofradia;
    }

    public Ubicacion getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(Ubicacion ubicacion) {
        this.ubicacion = ubicacion;
    }
}
