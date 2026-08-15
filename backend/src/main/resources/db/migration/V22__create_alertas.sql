-- Subtipo Alerta de notificaciones (ver V20): urgente, sobre la procesión o
-- el evento en curso (incidencia, corte de calle, cambio de horario...).
-- El "ENUM" del Apéndice C se implementa como VARCHAR + CHECK, igual que en
-- el resto del esquema (eventos.estado, codigos_acceso.estado...): más simple
-- de mantener que un tipo ENUM nativo de PostgreSQL.
CREATE TABLE alertas (
    id            BIGINT PRIMARY KEY REFERENCES notificaciones(id),
    tipo_alerta   VARCHAR(30) NOT NULL
                      CHECK (tipo_alerta IN ('INCIDENCIA', 'CAMBIO_HORARIO', 'CANCELACION',
                                              'CORTE_CALLE', 'METEOROLOGIA', 'SEGURIDAD')),
    prioridad     VARCHAR(10) NOT NULL
                      CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE'))
);
