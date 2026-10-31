-- Gestión de administradores desde la app (2026-10-31): un Administrador da
-- de alta a otro con una contraseña provisional que le llega por correo,
-- igual que a los miembros de Junta, y que debe cambiar al entrar. Los
-- administradores que ya existen (el del bootstrap) no tienen nada que cambiar.
ALTER TABLE administradores ADD COLUMN password_provisional BOOLEAN NOT NULL DEFAULT FALSE;
