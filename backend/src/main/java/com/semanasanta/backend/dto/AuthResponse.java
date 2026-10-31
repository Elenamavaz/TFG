package com.semanasanta.backend.dto;

// "activo" solo tiene un significado real para rol JUNTA (ver
// MiembroJuntaCofradia.activo): un miembro desactivado sigue pudiendo
// iniciar sesión -por eso AuthService.login no lo rechaza-, pero el
// frontend usa este campo para llevarle a un aviso de "cuenta desactivada"
// en vez de al panel, y el backend le rechaza cualquier escritura aparte
// (ver MiembroJuntaCofradiaService.exigirJunta). Para ADMIN y COFRADE
// siempre viene a true: no existe tal estado para esos roles.
//
// "passwordProvisional" (2026-10-17): true para un miembro de Junta -o,
// desde el 2026-10-31, un Administrador dado de alta por otro- que aún no
// ha cambiado la contraseña que le llegó por correo. El frontend le lleva
// entonces a cambiarla antes de entrar al panel, y el backend le rechaza el
// resto de operaciones mientras tanto (ver MiembroJuntaCofradiaService.exigirJunta
// y AdministradorService.exigirAdministrador).
public record AuthResponse(
        String token,
        String rol,
        Long usuarioId,
        boolean activo,
        boolean passwordProvisional
) {
}
