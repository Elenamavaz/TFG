-- Coordenadas del centro de la ciudad (2026-08-23, a petición de Elena):
-- recuperan la preselección por GPS en el arranque del modo Ciudadano,
-- quitada el 2026-08-15 porque Ciudad no tenía estos campos en el backend
-- real (solo existían en el mock/diseño de Figma -ver geo.js/
-- arranqueCiudadano.js del cliente). Nullable: una ciudad puede seguir
-- creándose sin coordenadas -sin ellas, simplemente no entra en el cálculo
-- de "ciudad más cercana" del cliente.
ALTER TABLE ciudades ADD COLUMN latitud DOUBLE PRECISION;
ALTER TABLE ciudades ADD COLUMN longitud DOUBLE PRECISION;
