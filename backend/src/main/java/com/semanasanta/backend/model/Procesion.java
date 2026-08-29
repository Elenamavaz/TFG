package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.7 del Apéndice C: procesiones.
// Decisión del 2026-08-10: "las procesiones son eventos que tienen dos
// atributos más (fechaInicio, fechaFin) y tres relaciones (pasos,
// posicionActual y recorrido)". Hereda de Evento en vez de referenciarlo por
// FK (nombre, historia, tradicion, fecha, estado, cofradias y ubicacion los
// hereda tal cual, incluida la relación N:M con Cofradia). posicionActual se
// añade en el siguiente paso. La relación con pasos, aunque la describía
// aquí el Apéndice C, se ha subido a Evento el 2026-08-23 -ver Evento.java-
// porque un Evento suelto también puede tener pasos, no solo una Procesion;
// getPasos()/addPaso()/removePaso() siguen funcionando igual aquí, heredados.
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

    // Marca de agua de la estela en vivo (2026-08-22, ver
    // PosicionActualService.estela): fracción 0..1 del recorrido hasta donde
    // ha llegado ya el cofrade más atrasado/más adelantado. Solo AVANZAN,
    // nunca se guarda un valor menor -así un corte de cobertura puntual no
    // hace retroceder la estela pintada. NULL hasta el primer ping.
    @Column(name = "progreso_cola_alcanzado")
    private Double progresoColaAlcanzado;

    @Column(name = "progreso_cabeza_alcanzado")
    private Double progresoCabezaAlcanzado;

    protected Procesion() {
    }

    public Procesion(String nombre, String historia, String tradicion, LocalDateTime fecha,
                      Ubicacion ubicacion, String web, LocalDateTime fechaInicio, LocalDateTime fechaFin,
                      Recorrido recorrido) {
        super(nombre, historia, tradicion, fecha, ubicacion, web);
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

    public Double getProgresoColaAlcanzado() {
        return progresoColaAlcanzado;
    }

    public void setProgresoColaAlcanzado(Double progresoColaAlcanzado) {
        this.progresoColaAlcanzado = progresoColaAlcanzado;
    }

    public Double getProgresoCabezaAlcanzado() {
        return progresoCabezaAlcanzado;
    }

    public void setProgresoCabezaAlcanzado(Double progresoCabezaAlcanzado) {
        this.progresoCabezaAlcanzado = progresoCabezaAlcanzado;
    }
}
