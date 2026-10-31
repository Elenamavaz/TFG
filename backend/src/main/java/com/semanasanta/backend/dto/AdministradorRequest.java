package com.semanasanta.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// Alta de un Administrador por otro (2026-10-31): sin contraseña, igual que
// MiembroJuntaCofradiaRequest -la genera el sistema y se la manda por correo
// (ver AdministradorService.crear), nadie tiene que inventársela ni pasársela.
public record AdministradorRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String email,
        String telefono
) {
}
