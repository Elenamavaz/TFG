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

    private String telefono;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "junta_cofradias_id", nullable = false)
    private JuntaCofradias juntaCofradias;

    // Lo alterna el Administrador (ver MiembroJuntaCofradiaService.actualizar).
    // Desactivado no significa "sin acceso": el login le sigue funcionando,
    // pero el backend le rechaza cualquier escritura -ver exigirJunta().
    @Column(nullable = false)
    private boolean activo;

    // TRUE hasta que el miembro cambia la contraseña provisional que se le
    // generó y mandó por correo al crearlo (AuthService.cambiarPassword la
    // pone a FALSE). Es la señal de "invitación pendiente": no bloquea nada,
    // solo informa de que el alta no está terminada del todo.
    @Column(name = "password_provisional", nullable = false)
    private boolean passwordProvisional;

    // Un miembro desactivado la pone a TRUE pidiendo que se le reactive (ver
    // solicitarReactivacion); el Administrador la resuelve aceptando
    // (activo=true) o rechazando (vuelve a FALSE, sigue desactivado) -ver
    // aceptarReactivacion/rechazarReactivacion.
    @Column(name = "solicitud_reactivacion_pendiente", nullable = false)
    private boolean solicitudReactivacionPendiente;

    protected MiembroJuntaCofradia() {
    }

    public MiembroJuntaCofradia(String nombre, String email, String telefono, String passwordHash, JuntaCofradias juntaCofradias) {
        super(email, passwordHash);
        this.nombre = nombre;
        this.telefono = telefono;
        this.juntaCofradias = juntaCofradias;
        this.activo = true;
        this.passwordProvisional = true;
        this.solicitudReactivacionPendiente = false;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
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

    public boolean isPasswordProvisional() {
        return passwordProvisional;
    }

    public void setPasswordProvisional(boolean passwordProvisional) {
        this.passwordProvisional = passwordProvisional;
    }

    public boolean isSolicitudReactivacionPendiente() {
        return solicitudReactivacionPendiente;
    }

    public void setSolicitudReactivacionPendiente(boolean solicitudReactivacionPendiente) {
        this.solicitudReactivacionPendiente = solicitudReactivacionPendiente;
    }
}
