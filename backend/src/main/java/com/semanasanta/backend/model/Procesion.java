package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

// Tabla C.7 del Apéndice C: procesiones.
// Decisión del 2026-08-10: "las procesiones son eventos que tienen dos
// atributos más (fechaInicio, fechaFin) y tres relaciones (pasos,
// posicionActual y recorrido)". Hereda de Evento en vez de referenciarlo por
// FK (nombre, historia, tradicion, fecha, estado, cofradia y ubicacion los
// hereda tal cual). posicionActual se añade en el siguiente paso.
@Entity
@Table(name = "procesiones")
@PrimaryKeyJoinColumn(name = "id")
public class Procesion extends Evento {

    @Column(name = "fecha_inicio")
    private LocalDateTime fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDateTime fechaFin;

    // Opcional: una procesión puede estar programada antes de tener ruta
    // definida. UNIQUE en la BD porque es 1:1 (una ruta no se comparte entre
    // procesiones).
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorrido_id", unique = true)
    private Recorrido recorrido;

    // Relación N:M con Paso (Tabla C.4.1 del Apéndice C, tabla intermedia
    // pasos_procesiones). Set, no List: es la forma habitual de mapear
    // @ManyToMany en JPA (evita duplicados y problemas de rendimiento que
    // puede dar List con varias colecciones "a la vez" cargadas ansiosamente).
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "pasos_procesiones",
            joinColumns = @JoinColumn(name = "procesion_id"),
            inverseJoinColumns = @JoinColumn(name = "paso_id")
    )
    private Set<Paso> pasos = new HashSet<>();

    protected Procesion() {
    }

    public Procesion(String nombre, String historia, String tradicion, LocalDateTime fecha, Cofradia cofradia,
                      Ubicacion ubicacion, LocalDateTime fechaInicio, LocalDateTime fechaFin, Recorrido recorrido) {
        super(nombre, historia, tradicion, fecha, cofradia, ubicacion);
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.recorrido = recorrido;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Recorrido getRecorrido() {
        return recorrido;
    }

    public void setRecorrido(Recorrido recorrido) {
        this.recorrido = recorrido;
    }

    public Set<Paso> getPasos() {
        return pasos;
    }

    // Sin setPasos(Set<Paso>): se gestiona con añadir/quitar de uno en uno,
    // no reemplazando la colección entera (evita perder el control de qué
    // cambió realmente en una actualización).
    public void addPaso(Paso paso) {
        this.pasos.add(paso);
    }

    public void removePaso(Paso paso) {
        this.pasos.remove(paso);
    }
}
