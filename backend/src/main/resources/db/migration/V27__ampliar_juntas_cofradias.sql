-- Ampliación de "juntas_cofradias" para el panel de Administrador (mockup
-- del 2026-08-16): "activa" -mismo patrón que ciudades.activa (V25)- para
-- poder desactivar una Junta sin borrarla. No libera el hueco de la ciudad
-- para una Junta nueva -junta_cofradias.ciudad_id sigue siendo UNIQUE para
-- siempre, desactivar no borra la fila.
ALTER TABLE juntas_cofradias
    ADD COLUMN activa BOOLEAN NOT NULL DEFAULT TRUE;
