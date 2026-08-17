package com.semanasanta.backend.dto;

import jakarta.validation.constraints.NotBlank;

// Cuerpo de entrada para crear/editar una Ciudad (POST/PUT). "activa" se
// ignora al crear (una ciudad nueva siempre nace activa, ver Ciudad) y solo
// se aplica al editar -no hace falta un DTO aparte para eso, igual que
// Evento.estado no se lee en EventoService.crear.
public record CiudadRequest(
        @NotBlank(message = "El nombre de la ciudad es obligatorio")
        String nombre,
        String comunidadAutonoma,
        String provincia,
        String historia,
        String patrimonio,
        boolean activa
) {
}
