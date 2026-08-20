package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Cuerpo de "Editar perfil" del panel de Junta -mismo patrón que
// AdministradorPerfilRequest: a diferencia de MiembroJuntaCofradiaRequest
// (que usa el Administrador para dar de alta/editar a OTRO), aquí es el
// propio miembro editando SUS datos, así que pide passwordActual SIEMPRE,
// incluso si no va a cambiar la contraseña. passwordNueva es opcional -en
// blanco significa "no cambiar la contraseña".
public record MiembroJuntaCofradiaPerfilRequest(
        @NotBlank(message = "El nombre es obligatorio")
        String nombre,
        String telefono,
        @NotBlank(message = "La contraseña actual es obligatoria")
        String passwordActual,
        @Pattern(regexp = "^$|^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
                message = "La contraseña nueva debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial")
        String passwordNueva
) {
}
