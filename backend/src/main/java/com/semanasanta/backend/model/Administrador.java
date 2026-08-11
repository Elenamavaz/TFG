package com.semanasanta.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;

// Subtipo Administrador: rol global (decisión del 2026-08-10), sin FK a
// Ciudad -- cualquier Administrador puede gestionar cualquier ciudad.
@Entity
@Table(name = "administradores")
@PrimaryKeyJoinColumn(name = "id")
public class Administrador extends Usuario {

    protected Administrador() {
    }

    public Administrador(String email, String passwordHash) {
        super(email, passwordHash);
    }
}
