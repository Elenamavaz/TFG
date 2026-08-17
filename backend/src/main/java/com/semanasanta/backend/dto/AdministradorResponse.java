package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Administrador;

import java.time.LocalDateTime;

public record AdministradorResponse(
        Long id,
        String email,
        String nombre,
        String telefono,
        LocalDateTime fechaIngreso
) {
    public static AdministradorResponse from(Administrador administrador) {
        return new AdministradorResponse(
                administrador.getId(),
                administrador.getEmail(),
                administrador.getNombre(),
                administrador.getTelefono(),
                administrador.getFechaIngreso()
        );
    }
}
