-- Subtipo Administrador: rol global (decisión del 2026-08-10), sin FK a
-- Ciudad -- cualquier Administrador puede gestionar cualquier ciudad del
-- sistema, no tiene sentido atarlo de antemano a una que aún no existe.
-- Sin columnas propias por ahora: solo hereda id/email/password_hash/
-- fecha_ingreso de usuarios.
CREATE TABLE administradores (
    id   BIGINT PRIMARY KEY REFERENCES usuarios(id)
);
