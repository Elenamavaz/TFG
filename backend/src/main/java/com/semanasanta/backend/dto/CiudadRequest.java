package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;

// Cuerpo de entrada para crear/editar una Ciudad (POST/PUT).
public record CiudadRequest(
        @NotBlank(message = "El nombre de la ciudad es obligatorio")
        String nombre,
        String comunidadAutonoma,
        String descripcion
) {
}
