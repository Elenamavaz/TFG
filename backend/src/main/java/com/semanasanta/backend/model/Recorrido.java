package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Tabla C.8 del Apéndice C: recorridos.
// "Itinerario asociado a una procesión, compuesto por puntos de ruta
// ordenados" (RI-05, RI-06). No referencia a nada: es Procesion quien la
// referenciará a ella (1:1), cuando exista.
@Entity
@Table(name = "recorridos")
public class Recorrido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "distancia_total")
    private Double distanciaTotal;

    @Column(name = "tiempo_estimado")
    private Integer tiempoEstimado;

    protected Recorrido() {
    }

    public Recorrido(Double distanciaTotal, Integer tiempoEstimado) {
        this.distanciaTotal = distanciaTotal;
        this.tiempoEstimado = tiempoEstimado;
    }

    public Long getId() {
        return id;
    }

    public Double getDistanciaTotal() {
        return distanciaTotal;
    }

    public void setDistanciaTotal(Double distanciaTotal) {
        this.distanciaTotal = distanciaTotal;
    }

    public Integer getTiempoEstimado() {
        return tiempoEstimado;
    }

    public void setTiempoEstimado(Integer tiempoEstimado) {
        this.tiempoEstimado = tiempoEstimado;
    }
}
