package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.MiembroJuntaCofradia;

import java.time.LocalDateTime;

// Sin password ni passwordHash: nunca se devuelve, ni siquiera hasheada.
public record MiembroJuntaCofradiaResponse(
        Long id,
        String nombre,
        String email,
        LocalDateTime fechaIngreso,
        Long juntaCofradiasId,
        boolean activo
) {
    public static MiembroJuntaCofradiaResponse from(MiembroJuntaCofradia miembro) {
        return new MiembroJuntaCofradiaResponse(
                miembro.getId(),
                miembro.getNombre(),
                miembro.getEmail(),
                miembro.getFechaIngreso(),
                miembro.getJuntaCofradias().getId(),
                miembro.isActivo()
        );
    }
}
