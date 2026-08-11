-- Subtipo MiembroJuntaCofradia: una persona con credenciales que pertenece a
-- la Junta de Cofradías de una ciudad (1..* miembros por Junta, según el
-- diagrama de dominio). FK a juntas_cofradias, no a ciudades directamente:
-- así se reutiliza la relación 1:1 JuntaCofradias-Ciudad que ya existe, en
-- vez de duplicarla aquí. Esto cierra el hueco detectado el 2026-08-10: antes
-- no había forma de saber qué ciudad gestiona un usuario con rol Junta.
CREATE TABLE miembros_junta_cofradia (
    id                    BIGINT PRIMARY KEY REFERENCES usuarios(id),
    junta_cofradias_id    BIGINT NOT NULL REFERENCES juntas_cofradias(id)
);
