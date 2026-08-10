package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.3 del Apéndice C: cofradias.
// "Asociación religiosa que organiza eventos y procesiones. Pertenece a la
// ciudad" (Requisito RI-02).
//
// No tiene una lista de Pasos/Eventos/Procesiones como atributo: siguiendo el
// mismo criterio que ya usa el modelo de dominio del cliente (memoria
// "Relaciones 1↔N... se resuelven por FK inversa desde el servicio
// correspondiente, no como arrays guardados en Cofradia"), esas colecciones se
// consultan desde el lado "muchos" (p.ej. CofradiaRepository.findByCiudadId,
// más adelante PasoRepository.findByCofradiaId), no se guardan aquí.
@Entity
@Table(name = "cofradias")
public class Cofradia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "historia")
    private String historia;

    @Column(name = "web")
    private String web;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ciudad_id", nullable = false)
    private Ciudad ciudad;

    protected Cofradia() {
    }

    public Cofradia(String nombre, String historia, String web,
                     LocalDateTime fechaCreacion, Ciudad ciudad) {
        this.nombre = nombre;
        this.historia = historia;
        this.web = web;
        this.fechaCreacion = fechaCreacion;
        this.ciudad = ciudad;
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

    public String getWeb() {
        return web;
    }

    public void setWeb(String web) {
        this.web = web;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public Ciudad getCiudad() {
        return ciudad;
    }

    public void setCiudad(Ciudad ciudad) {
        this.ciudad = ciudad;
    }
}
