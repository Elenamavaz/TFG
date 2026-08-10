package com.semanasanta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Tabla C.1 del Apéndice C de la memoria: ciudades.
// "Agrupa las procesiones y actos de cada localidad" (Requisitos RI-10, RI-09).
@Entity
@Table(name = "ciudades")
public class Ciudad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "comunidad_autonoma")
    private String comunidadAutonoma;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    protected Ciudad() {
        // Constructor sin argumentos requerido por JPA.
    }

    public Ciudad(String nombre, String comunidadAutonoma, String descripcion) {
        this.nombre = nombre;
        this.comunidadAutonoma = comunidadAutonoma;
        this.descripcion = descripcion;
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

    public String getComunidadAutonoma() {
        return comunidadAutonoma;
    }

    public void setComunidadAutonoma(String comunidadAutonoma) {
        this.comunidadAutonoma = comunidadAutonoma;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
