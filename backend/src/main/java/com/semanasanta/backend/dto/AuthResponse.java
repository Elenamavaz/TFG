package com.semanasanta.backend.dto;

// "activo" solo tiene un significado real para rol JUNTA (ver
// MiembroJuntaCofradia.activo): un miembro desactivado sigue pudiendo
// iniciar sesión -por eso AuthService.login no lo rechaza-, pero el
// frontend usa este campo para llevarle a un aviso de "cuenta desactivada"
// en vez de al panel, y el backend le rechaza cualquier escritura aparte
// (ver MiembroJuntaCofradiaService.exigirJunta). Para ADMIN y COFRADE
// siempre viene a true: no existe tal estado para esos roles.
public record AuthResponse(
        String token,
        String rol,
        Long usuarioId,
        boolean activo
) {
}
