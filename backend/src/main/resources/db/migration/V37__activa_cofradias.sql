-- "activa" en cofradias (2026-08-22, a petición de Elena): mismo patrón que
-- ciudades.activa (V25/CiudadService) -permite a la Junta dar de alta una
-- cofradía mientras la sigue completando, sin que el ciudadano la vea
-- todavía en la app. DEFAULT TRUE: todas las cofradías ya existentes se
-- consideran activas (es lo que había hasta ahora, sin este campo).
ALTER TABLE cofradias ADD COLUMN activa BOOLEAN NOT NULL DEFAULT TRUE;
