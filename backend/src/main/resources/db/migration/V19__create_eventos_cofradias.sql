-- Tabla intermedia N:M entre eventos y cofradias (decisión del 2026-08-11,
-- cambia el Apéndice C: un evento/procesión puede tener más de una cofradía
-- participando, no solo la que lo organiza). PK compuesta, como
-- pasos_procesiones: aquí no hace falta ninguna columna propia (ni orden ni
-- fecha), es una relación pura de pertenencia.
CREATE TABLE eventos_cofradias (
    evento_id     BIGINT NOT NULL REFERENCES eventos(id),
    cofradia_id   BIGINT NOT NULL REFERENCES cofradias(id),
    PRIMARY KEY (evento_id, cofradia_id)
);
