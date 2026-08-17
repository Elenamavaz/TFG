-- Ampliación de "ciudades" para el panel de Administrador (mockup del
-- 2026-08-16). "descripcion" se renombra a "historia" -mismo nombre que ya
-- usan cofradias/pasos/eventos para el mismo concepto, Ciudad era la única
-- excepción-; verificado antes de renombrar que el cliente todavía no leía
-- ese campo en ninguna pantalla, así que no rompe el módulo ciudadano ya
-- conectado. "activa" controla si el ciudadano la ve en el selector de
-- ciudad (GET /ciudades sigue siendo público, pero por defecto solo lista
-- las activas -ver CiudadService.listar); el Administrador sí ve también
-- las desactivadas con ?incluirInactivas=true.
ALTER TABLE ciudades RENAME COLUMN descripcion TO historia;
ALTER TABLE ciudades
    ADD COLUMN provincia VARCHAR(255),
    ADD COLUMN numero_cofradias_estimado INTEGER,
    ADD COLUMN patrimonio TEXT,
    ADD COLUMN activa BOOLEAN NOT NULL DEFAULT TRUE;
