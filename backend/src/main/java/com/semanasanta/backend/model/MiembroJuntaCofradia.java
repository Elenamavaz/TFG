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

    // Lo alterna el Administrador (ver MiembroJuntaCofradiaService.actualizar).
    // Desactivado no significa "sin acceso": el login le sigue funcionando,
    // pero el backend le rechaza cualquier escritura -ver exigirJunta().
    @Column(nullable = false)
    private boolean activo;

    protected MiembroJuntaCofradia() {
    }

    public MiembroJuntaCofradia(String nombre, String email, String passwordHash, JuntaCofradias juntaCofradias) {
        super(email, passwordHash);
        this.nombre = nombre;
        this.juntaCofradias = juntaCofradias;
        this.activo = true;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public JuntaCofradias getJuntaCofradias() {
        return juntaCofradias;
    }

    public void setJuntaCofradias(JuntaCofradias juntaCofradias) {
        this.juntaCofradias = juntaCofradias;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }
}
