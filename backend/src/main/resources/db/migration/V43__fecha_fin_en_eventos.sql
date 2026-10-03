-- fecha_fin sube de procesiones a eventos (2026-09-30): "los eventos también
-- tienen duración", no solo las procesiones. Con ella,
-- CambioEstadoAutomaticoService puede finalizar solo cualquier Evento (o
-- Procesion, que lo hereda) al llegar la hora. Se copian los valores
-- existentes antes de quitar la columna vieja, para no perder la hora de fin
-- de las procesiones ya creadas.
ALTER TABLE eventos ADD COLUMN fecha_fin TIMESTAMP;

UPDATE eventos e
SET fecha_fin = p.fecha_fin
FROM procesiones p
WHERE p.id = e.id;

ALTER TABLE procesiones DROP COLUMN fecha_fin;
