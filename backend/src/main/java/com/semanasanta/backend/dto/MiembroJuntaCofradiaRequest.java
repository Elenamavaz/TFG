package com.semanasanta.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Sin "password": el Administrador no la elige, la genera el Service al
// azar y se la manda por correo al email de aquí (ver
// MiembroJuntaCofradiaService.crear y CorreoService) -así nunca pasa en
// claro por la petición HTTP ni queda en manos del Administrador. "activo"
// se ignora al crear (un miembro nuevo siempre nace activo, ya se le manda
// la contraseña por correo) y solo se aplica al editar -mismo patrón que
// CiudadRequest/JuntaCofradiasRequest.
public record MiembroJuntaCofradiaRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String email,
        String telefono,
        @NotNull(message = "juntaCofradiasId es obligatorio")
        Long juntaCofradiasId,
        boolean activo
) {
}
