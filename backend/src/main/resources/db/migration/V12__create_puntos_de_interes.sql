-- Subtipo PuntoDeInteres del diagrama de dominio (Figura 3.5): un PuntoRuta
-- "con detalle" (nombre, descripción, tipo, imagen). Su id es a la vez PK y
-- FK a puntos_ruta(id) — herencia JOINED, igual que procesiones/eventos.
CREATE TABLE puntos_de_interes (
    id            BIGINT PRIMARY KEY REFERENCES puntos_ruta(id),
    tipo          VARCHAR(20) NOT NULL CHECK (tipo IN
                      ('MONUMENTO', 'IGLESIA', 'ENCUENTRO', 'ORACCION',
                       'ENTRADAPROCESION', 'SALIDAPROCESION', 'UBICACIONEVENTO')),
    nombre        VARCHAR(255) NOT NULL,
    descripcion   TEXT,
    imagen        VARCHAR(500)
);
