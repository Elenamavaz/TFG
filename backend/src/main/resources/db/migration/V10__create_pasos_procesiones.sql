-- Tabla C.4.1 del Apéndice C: pasos_procesiones — tabla intermedia N:M.
CREATE TABLE pasos_procesiones (
    paso_id        BIGINT NOT NULL REFERENCES pasos(id),
    procesion_id   BIGINT NOT NULL REFERENCES procesiones(id),
    PRIMARY KEY (paso_id, procesion_id)
);
