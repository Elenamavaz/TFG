package com.semanasanta.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

// Subtipo Administrador: rol global (decisión del 2026-08-10), sin FK a
// Ciudad -- cualquier Administrador puede gestionar cualquier ciudad.
// nombre/telefono añadidos el 2026-08-16 para "Editar perfil" (mockup del
// panel de Administrador); nullable porque no se piden al crear la cuenta
// (ni en /administradores ni en el bootstrap), solo se completan cuando el
// propio Administrador edita su perfil -ver AdministradorService.actualizarPerfilPropio.
@Entity
@Table(name = "administradores")
@PrimaryKeyJoinColumn(name = "id")
public class Administrador extends Usuario {

    private String nombre;

    private String telefono;

    // Alta desde la app (2026-10-31, ver AdministradorService.crear): igual
    // que MiembroJuntaCofradia.passwordProvisional, true hasta que cambia la
    // contraseña que le llegó por correo. El del bootstrap nace en false.
    private boolean passwordProvisional;

    protected Administrador() {
    }

    public Administrador(String email, String passwordHash) {
        super(email, passwordHash);
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

    public boolean isPasswordProvisional() {
        return passwordProvisional;
    }

    public void setPasswordProvisional(boolean passwordProvisional) {
        this.passwordProvisional = passwordProvisional;
    }
}
