package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// Para Administrador y MiembroJuntaCofradia (ver AuthService.cambiarPassword):
// exige la contraseña actual, no basta con estar autenticado -así un token
// robado a alguien que dejó sesión abierta no basta por sí solo para
// cambiarle la contraseña y echarle de su propia cuenta.
public record CambiarPasswordRequest(
        @NotBlank(message = "La contraseña actual es obligatoria")
        String passwordActual,
        @NotBlank(message = "La contraseña nueva es obligatoria")
        @Size(min = 8, message = "La contraseña nueva debe tener al menos 8 caracteres")
        // Misma regla que AdministradorRequest.password: al menos una
        // mayúscula, un número y un carácter especial (ninguna letra ni dígito).
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).*$",
                message = "La contraseña nueva debe tener al menos una mayúscula, un número y un carácter especial")
        String passwordNueva
) {
}
