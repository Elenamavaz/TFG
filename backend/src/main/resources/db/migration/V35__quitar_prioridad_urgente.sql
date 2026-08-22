-- Quita URGENTE de Prioridad (2026-08-22, a petición de Elena, ver
-- Prioridad.java): en la práctica ya era indistinguible de ALTA en la UI
-- (mismo color rojo, ver Notificacion.colorCategoria del cliente), así que
-- no se ganaba su sitio como cuarto nivel. Las filas existentes con
-- prioridad URGENTE pasan a ALTA (sin pérdida real de información, ya se
-- veían igual) antes de estrechar el CHECK -si no, la propia migración
-- fallaría contra datos que ya no cumplirían la restricción nueva.
UPDATE notificaciones SET prioridad = 'ALTA' WHERE prioridad = 'URGENTE';

ALTER TABLE notificaciones DROP CONSTRAINT IF EXISTS notificaciones_prioridad_check;
ALTER TABLE notificaciones ADD CONSTRAINT notificaciones_prioridad_check
    CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA'));
