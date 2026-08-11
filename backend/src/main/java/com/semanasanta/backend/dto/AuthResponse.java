package com.semanasanta.backend.dto;

public record AuthResponse(
        String token,
        String rol,
        Long usuarioId
) {
}
