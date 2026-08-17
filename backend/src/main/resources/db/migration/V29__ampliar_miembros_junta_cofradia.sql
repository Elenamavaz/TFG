-- Estado activo/desactivado de un Miembro de Junta (lo alterna el
-- Administrador, mismo patrón que ciudades.activa/juntas_cofradias.activa):
-- un miembro desactivado sigue pudiendo iniciar sesión (ve un aviso pidiendo
-- que se le reactive, ver AuthResponse.activo), pero el backend le rechaza
-- cualquier escritura -MiembroJuntaCofradiaService.exigirJunta().
-- Nace en TRUE: se le crea la cuenta y se le manda la contraseña por
-- correo (MiembroJuntaCofradiaService.crear), así que ya puede entrar.
ALTER TABLE miembros_junta_cofradia ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;
