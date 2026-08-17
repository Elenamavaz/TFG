package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

// Cuerpo de "Editar perfil" (panel de Administrador) -- a diferencia de
// AdministradorRequest (crear una cuenta nueva), aquí es el propio
// Administrador editando SUS datos, así que pide passwordActual SIEMPRE,
// incluso si no va a cambiar la contraseña (confirma que es él quien edita,
// no solo que tiene un JWT válido -mismo motivo que CambiarPasswordRequest).
// passwordNueva es opcional: en blanco significa "no cambiar la contraseña"
// -por eso el patrón acepta también la cadena vacía, no solo contraseñas
// que cumplan la regla de complejidad.
public record AdministradorPerfilRequest(
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
