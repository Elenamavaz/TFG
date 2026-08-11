-- Tabla C.7 del Apéndice C: procesiones.
-- Decisión del 2026-08-10: Procesion hereda de Evento (JPA @Inheritance
-- JOINED), no tiene evento_id ni cofradia_id ni estado propios (viven en
-- "eventos"). Su "id" es a la vez PK y FK a eventos(id) -- no se autogenera
-- aquí, Hibernate copia el id ya generado al insertar en "eventos".
-- Pendiente actualizar el texto del Apéndice C y el diagrama de dominio.
CREATE TABLE procesiones (
    id             BIGINT PRIMARY KEY REFERENCES eventos(id),
    fecha_inicio   TIMESTAMP,
    fecha_fin      TIMESTAMP,
    recorrido_id   BIGINT UNIQUE REFERENCES recorridos(id)
);
