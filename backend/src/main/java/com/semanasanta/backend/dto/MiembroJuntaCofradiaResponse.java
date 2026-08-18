package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.MiembroJuntaCofradia;

import java.time.LocalDateTime;

// Sin password ni passwordHash: nunca se devuelve, ni siquiera hasheada.
// "passwordProvisional" es la señal de "invitación pendiente" (sin cambiar
// la contraseña generada al crear la cuenta); "solicitudReactivacionPendiente"
// es la de "está pidiendo que se le reactive" -ver MiembroJuntaCofradia.
public record MiembroJuntaCofradiaResponse(
        Long id,
        String nombre,
        String email,
        String telefono,
        LocalDateTime fechaIngreso,
        Long juntaCofradiasId,
        boolean activo,
        boolean passwordProvisional,
        boolean solicitudReactivacionPendiente
) {
    public static MiembroJuntaCofradiaResponse from(MiembroJuntaCofradia miembro) {
        return new MiembroJuntaCofradiaResponse(
                miembro.getId(),
                miembro.getNombre(),
                miembro.getEmail(),
                miembro.getTelefono(),
                miembro.getFechaIngreso(),
                miembro.getJuntaCofradias().getId(),
                miembro.isActivo(),
                miembro.isPasswordProvisional(),
                miembro.isSolicitudReactivacionPendiente()
        );
    }
}
