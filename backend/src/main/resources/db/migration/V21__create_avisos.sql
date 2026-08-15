-- Subtipo Aviso de notificaciones (ver V20): informativo, sin urgencia.
-- fecha_expiracion es opcional -- un aviso puede no caducar nunca.
CREATE TABLE avisos (
    id                BIGINT PRIMARY KEY REFERENCES notificaciones(id),
    fecha_expiracion  TIMESTAMP
);
