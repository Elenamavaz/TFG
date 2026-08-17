-- Ampliación de "administradores" para la pantalla "Editar perfil" del panel
-- de Administrador (mockup del 2026-08-16). Ambas columnas nullable a
-- propósito: los Administradores ya creados antes de esta migración (p.ej.
-- vía /administradores/bootstrap) no tienen nombre todavía -se completa la
-- primera vez que editen su perfil, no se rellena aquí con un valor de relleno.
ALTER TABLE administradores
    ADD COLUMN nombre VARCHAR(255),
    ADD COLUMN telefono VARCHAR(50);
