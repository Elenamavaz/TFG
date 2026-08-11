package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Tabla "ubicaciones": no existe en el Apéndice C tal cual está redactado en
// el PDF (hueco detectado el 2026-08-10). Punto geográfico reutilizable,
// referenciado por Evento y PuntoRuta (y potencialmente por más entidades).
@Entity
@Table(name = "ubicaciones")
public class Ubicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double latitud;

    @Column(nullable = false)
    private Double longitud;

    private String direccion;

    protected Ubicacion() {
    }

    public Ubicacion(Double latitud, Double longitud, String direccion) {
        this.latitud = latitud;
        this.longitud = longitud;
        this.direccion = direccion;
    }

    public Long getId() {
        return id;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
}
