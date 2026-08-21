-- Colapsa la jerarquía notificaciones/avisos/alertas (V20-V22) en una sola
-- tabla (2026-08-20, ver Notificacion): la diferencia real entre Aviso y
-- Alerta era mínima (fecha_expiracion vs tipo_alerta+prioridad) y esa
-- herencia ya costó un bug real de Hibernate (proxy JOINED sin unproxy, ver
-- memoria del TFG). Revierte a lo que el propio Apéndice C proponía antes de
-- la decisión del 2026-08-14: una tabla, con columna "tipo" y columnas
-- nullable según el caso -- V21/V22 no se tocan ni se borran (no se editan
-- migraciones ya aplicadas), quedan como historial de cómo se llegó aquí.
--
-- Datos existentes: se descartan (DELETE) en vez de migrarse fila a fila --
-- son datos de prueba de una tabla que hasta ahora no se ha desplegado en
-- producción (ver memoria del TFG), no compensa escribir un UPDATE con JOIN
-- solo para conservarlos.
--
-- IF EXISTS/IF NOT EXISTS (2026-08-21): guardas añadidas tras un incidente
-- real en local -un `target/classes` con recursos obsoletos (Maven no borra
-- lo que ya no está en el código fuente salvo `mvn clean`) hizo que esta
-- misma migración se intentara aplicar dos veces seguidas en el mismo
-- arranque bajo dos números de versión distintos, y la segunda pasada
-- rompía porque avisos/alertas ya no existían. Con las guardas, volver a
-- aplicar este script sobre una BD que ya tiene el cambio hecho no falla.
DELETE FROM notificaciones;

DROP TABLE IF EXISTS avisos;
DROP TABLE IF EXISTS alertas;

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS mensaje TEXT;

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS tipo VARCHAR(20)
    CHECK (tipo IN ('INICIO', 'FIN', 'INCIDENCIA', 'CAMBIO_HORARIO', 'CANCELACION'));
ALTER TABLE notificaciones ALTER COLUMN tipo SET NOT NULL;

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS prioridad VARCHAR(10)
    CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE'));

ALTER TABLE notificaciones ADD COLUMN IF NOT EXISTS fecha_expiracion TIMESTAMP;
