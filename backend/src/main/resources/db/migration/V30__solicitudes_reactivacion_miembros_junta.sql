-- Dos señales nuevas sobre el estado de un Miembro de Junta, no una: solo la
-- segunda necesita que el Administrador haga algo.
-- - password_provisional: sigue en TRUE mientras el miembro no haya
--   cambiado la contraseña que se le generó y mandó por correo al crearlo
--   (ver MiembroJuntaCofradiaService.crear; AuthService.cambiarPassword la
--   pone a FALSE). Es la señal de "invitación pendiente" del mockup -no
--   representa ningún estado que el Admin deba aprobar, la cuenta ya existe
--   y ya funciona, es solo que el miembro no ha entrado a terminar el alta.
-- - solicitud_reactivacion_pendiente: un miembro desactivado (activo=false)
--   puede pedir que se le reactive desde CuentaDesactivadaScreen
--   (MiembroJuntaCofradiaService.solicitarReactivacion); esto SÍ necesita
--   que el Administrador la revise y la acepte o la rechace
--   (aceptarReactivacion/rechazarReactivacion).
ALTER TABLE miembros_junta_cofradia
    ADD COLUMN password_provisional BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN solicitud_reactivacion_pendiente BOOLEAN NOT NULL DEFAULT FALSE;
