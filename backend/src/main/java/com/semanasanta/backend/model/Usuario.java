package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.9 del Apéndice C: usuarios.
// Decisión del 2026-08-10, cambia el diseño del Apéndice C: raíz abstracta de
// una jerarquía de herencia real (JOINED). No tiene sentido un Usuario sin
// rol. Solo dos subtipos (MiembroJuntaCofradia, Administrador): el Cofrade
// dejó de ser un Usuario registrado el 2026-08-11 (ver PosicionActual).
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "usuarios")
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    protected Usuario() {
    }

    protected Usuario(String email, String passwordHash) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.fechaIngreso = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }
}
