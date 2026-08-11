package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.Administrador;

import java.time.LocalDateTime;

public record AdministradorResponse(
        Long id,
        String email,
        LocalDateTime fechaIngreso
) {
    public static AdministradorResponse from(Administrador administrador) {
        return new AdministradorResponse(
                administrador.getId(),
                administrador.getEmail(),
                administrador.getFechaIngreso()
        );
    }
}
