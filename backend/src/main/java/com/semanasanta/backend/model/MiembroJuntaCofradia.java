package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Subtipo MiembroJuntaCofradia: persona con credenciales que pertenece a la
// Junta de Cofradías de una ciudad. FK a JuntaCofradias (no a Ciudad
// directamente), reutilizando la relación 1:1 JuntaCofradias-Ciudad que ya
// existe -- cierra el hueco detectado el 2026-08-10 (antes no había forma de
// saber qué ciudad gestiona un usuario con este rol).
@Entity
@Table(name = "miembros_junta_cofradia")
@PrimaryKeyJoinColumn(name = "id")
public class MiembroJuntaCofradia extends Usuario {

    @Column(nullable = false)
    private String nombre;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "junta_cofradias_id", nullable = false)
    private JuntaCofradias juntaCofradias;

    protected MiembroJuntaCofradia() {
    }

    public MiembroJuntaCofradia(String nombre, String email, String passwordHash, JuntaCofradias juntaCofradias) {
        super(email, passwordHash);
        this.nombre = nombre;
        this.juntaCofradias = juntaCofradias;
    }

    public String getNombre() {
        return nombre;
    }

    public JuntaCofradias getJuntaCofradias() {
        return juntaCofradias;
    }

    public void setJuntaCofradias(JuntaCofradias juntaCofradias) {
        this.juntaCofradias = juntaCofradias;
    }
}
