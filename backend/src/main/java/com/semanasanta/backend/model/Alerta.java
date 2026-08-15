package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Subtipo Alerta: notificación urgente sobre la procesión/evento en curso
// (incidencia, corte de calle, cambio de horario...), con tipo y prioridad
// propios que un Aviso no tiene.
@Entity
@Table(name = "alertas")
@PrimaryKeyJoinColumn(name = "id")
public class Alerta extends Notificacion {

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_alerta", nullable = false)
    private TipoAlerta tipoAlerta;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioridad prioridad;

    protected Alerta() {
    }

    public Alerta(String titulo, Ciudad ciudad, TipoAlerta tipoAlerta, Prioridad prioridad) {
        super(titulo, ciudad);
        this.tipoAlerta = tipoAlerta;
        this.prioridad = prioridad;
    }

    public TipoAlerta getTipoAlerta() {
        return tipoAlerta;
    }

    public Prioridad getPrioridad() {
        return prioridad;
    }
}
