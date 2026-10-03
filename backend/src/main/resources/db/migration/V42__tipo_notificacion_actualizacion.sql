-- Añade ACTUALIZACION a notificaciones.tipo (2026-09-30, ver
-- TipoNotificacion): aviso opcional que la Junta manda tras editar una
-- procesión. El CHECK de V33 se creó inline al añadir la columna, así que
-- PostgreSQL le puso el nombre por defecto notificaciones_tipo_check -mismo
-- patrón que V35 con notificaciones_prioridad_check.
ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_tipo_check
    CHECK (tipo IN ('INICIO', 'FIN', 'INCIDENCIA', 'CAMBIO_HORARIO', 'CANCELACION', 'ACTUALIZACION'));
