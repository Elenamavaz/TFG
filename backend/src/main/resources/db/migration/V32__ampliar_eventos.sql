-- Dos ajustes en "eventos" para el mockup de "Nueva procesión" (2026-08-20):
-- - ubicacion_id deja de ser NOT NULL: una Procesion hereda esta tabla, pero
--   Elena señaló que una procesión no tiene un único punto -tiene un
--   recorrido (varios puntos en secuencia, ver Recorrido/PuntoRuta)-, así
--   que exigirle una ubicación fija era forzar un dato que no siempre tiene
--   sentido para ella. Un Evento suelto (una función, un concierto...) SÍ
--   ocurre en un sitio fijo, así que sigue siendo obligatorio -pero a nivel
--   de EventoRequest (@NotNull), no aquí: la restricción de la base de
--   datos solo se relaja para que ProcesionRequest pueda dejarla en blanco.
-- - web: "Web Oficial" del mockup, mismo patrón que Cofradia.web.
ALTER TABLE eventos ALTER COLUMN ubicacion_id DROP NOT NULL;
ALTER TABLE eventos ADD COLUMN web VARCHAR(255);
