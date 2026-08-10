package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.JuntaCofradias;

public record JuntaCofradiasResponse(
        Long id,
        String nombre,
        String email,
        String telefono,
        Long ciudadId
) {
    public static JuntaCofradiasResponse from(JuntaCofradias junta) {
        return new JuntaCofradiasResponse(
                junta.getId(),
                junta.getNombre(),
                junta.getEmail(),
                junta.getTelefono(),
                junta.getCiudad().getId()
        );
    }
}
