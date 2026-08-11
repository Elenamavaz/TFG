package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Tabla C.8.1 del Apéndice C: puntos_ruta.
// Decisión del 2026-08-10, cambia el diseño del Apéndice C: raíz de una
// jerarquía de herencia real (JOINED, igual que Evento/Procesion), no
// abstracta como en el diagrama de dominio -- aquí sí se pueden guardar
// puntos "de paso" simples directamente como PuntoRuta (sin nombre/tipo).
// PuntoDeInteres extiende esta clase y añade tipo/nombre/descripcion/imagen
// en su propia tabla "puntos_de_interes".
//
// Ya no referencia a Recorrido ni tiene orden/horaPrevista: un mismo punto
// (misma iglesia, misma plaza) puede formar parte de varios recorridos, y
// esos dos datos dependen de EN QUÉ recorrido esté, no del punto en sí -
// viven en RecorridoPuntoRuta (tabla intermedia N:M).
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "puntos_ruta")
public class PuntoRuta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ubicacion_id", nullable = false)
    private Ubicacion ubicacion;

    protected PuntoRuta() {
    }

    public PuntoRuta(Ubicacion ubicacion) {
        this.ubicacion = ubicacion;
    }

    public Long getId() {
        return id;
    }

    public Ubicacion getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(Ubicacion ubicacion) {
        this.ubicacion = ubicacion;
    }
}
