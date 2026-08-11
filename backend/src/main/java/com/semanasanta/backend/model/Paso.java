package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Tabla C.4 del Apéndice C: pasos.
// "Pasos que posee la cofradía." También tiene relación N:M con Procesion
// (a través de pasos_procesiones), que se añade cuando exista Procesion.
@Entity
@Table(name = "pasos")
public class Paso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String historia;

    @Column(columnDefinition = "TEXT")
    private String analisisArtistico;

    private String imagen;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cofradia_id", nullable = false)
    private Cofradia cofradia;

    protected Paso() {
    }

    public Paso(String nombre, String historia, String analisisArtistico, String imagen, Cofradia cofradia) {
        this.nombre = nombre;
        this.historia = historia;
        this.analisisArtistico = analisisArtistico;
        this.imagen = imagen;
        this.cofradia = cofradia;
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

    public String getAnalisisArtistico() {
        return analisisArtistico;
    }

    public void setAnalisisArtistico(String analisisArtistico) {
        this.analisisArtistico = analisisArtistico;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }

    public Cofradia getCofradia() {
        return cofradia;
    }

    public void setCofradia(Cofradia cofradia) {
        this.cofradia = cofradia;
    }
}
