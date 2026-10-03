package com.semanasanta.backend.dto;

// Lo único de una Ciudad que puede editar la Junta que la gestiona
// (2026-10-03, a petición de Elena): el texto informativo que ve el
// ciudadano. Nombre, comunidad, coordenadas y "activa" siguen siendo cosa
// del Administrador (CiudadRequest, PUT /ciudades/{id}).
public record CiudadInformacionRequest(
        String historia,
        String patrimonio
) {
}
