package com.semanasanta.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Solo para AdministradorService.crearBootstrap: crear el PRIMER
// Administrador del sistema, cuando todavía no hay nadie con quien
// autenticarse para pasar por el POST /administradores normal. "secreto" no
// es la contraseña de nadie -es ADMIN_BOOTSTRAP_SECRET (application.properties),
// la prueba de que quien llama tiene acceso al servidor (lo puso quien
// desplegó), no de que sea un usuario concreto.
public record AdministradorBootstrapRequest(
        @NotBlank(message = "El secreto de bootstrap es obligatorio")
        String secreto,
        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        String email,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).*$",
                message = "La contraseña debe tener al menos una mayúscula, un número y un carácter especial")
        String password
) {
}
