package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Subtipo Aviso: notificación informativa, sin urgencia (contraste con
// Alerta). fechaExpiracion es opcional -- un aviso puede no caducar nunca.
@Entity
@Table(name = "avisos")
@PrimaryKeyJoinColumn(name = "id")
public class Aviso extends Notificacion {

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    protected Aviso() {
    }

    public Aviso(String titulo, Ciudad ciudad, LocalDateTime fechaExpiracion) {
        super(titulo, ciudad);
        this.fechaExpiracion = fechaExpiracion;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }
}
