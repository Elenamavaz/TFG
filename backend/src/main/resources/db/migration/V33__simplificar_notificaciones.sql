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
DELETE FROM notificaciones;

DROP TABLE avisos;
DROP TABLE alertas;

ALTER TABLE notificaciones ADD COLUMN mensaje TEXT;

ALTER TABLE notificaciones ADD COLUMN tipo VARCHAR(20) NOT NULL
    CHECK (tipo IN ('INICIO', 'FIN', 'INCIDENCIA', 'CAMBIO_HORARIO', 'CANCELACION'));

ALTER TABLE notificaciones ADD COLUMN prioridad VARCHAR(10)
    CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE'));

ALTER TABLE notificaciones ADD COLUMN fecha_expiracion TIMESTAMP;
