-- Generaliza pasos_procesiones a pasos_eventos (2026-08-23, a petición de
-- Elena: "los eventos también pueden tener pasos", no solo las procesiones).
-- Procesion ya es un Evento (herencia JOINED, mismo id compartido en las dos
-- tablas), así que esta relación sube a Evento -mismo sitio donde ya vive
-- eventos_cofradias- y cualquier Evento suelto (no solo Procesion) puede
-- tener pasos asociados. Se conservan las filas ya existentes (los pares
-- paso-procesión de antes siguen siendo válidos, procesion_id y evento_id
-- son el mismo valor para una fila que ya era una Procesion).
ALTER TABLE pasos_procesiones RENAME TO pasos_eventos;
ALTER TABLE pasos_eventos RENAME COLUMN procesion_id TO evento_id;

-- La FK apuntaba a procesiones(id) -válido mientras solo procesiones podían
-- tener pasos-; ahora tiene que apuntar a eventos(id), la tabla base, para
-- que un Evento suelto (sin fila en procesiones) también pueda referenciarse
-- aquí.
ALTER TABLE pasos_eventos DROP CONSTRAINT IF EXISTS pasos_procesiones_procesion_id_fkey;
ALTER TABLE pasos_eventos ADD CONSTRAINT pasos_eventos_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES eventos(id);
