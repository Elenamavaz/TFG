-- Caducidad de los códigos de acceso (2026-10-25): hasta ahora un código
-- servía indefinidamente mientras la Junta no lo revocara, así que un QR
-- fotografiado en la iglesia seguía valiendo el año siguiente. Ahora cada
-- código caduca 24 horas después de emitirse (ver CodigoAcceso): la Junta
-- lo genera el mismo día de la procesión y al día siguiente ya no sirve.
--
-- Los códigos que ya existían reciben como fecha de emisión el momento de
-- esta migración, así que siguen valiendo 24 horas más en vez de quedar
-- inservibles de golpe.
ALTER TABLE codigos_acceso ADD COLUMN fecha_emision TIMESTAMP;
ALTER TABLE codigos_acceso ADD COLUMN fecha_expiracion TIMESTAMP;

UPDATE codigos_acceso
SET fecha_emision = CURRENT_TIMESTAMP,
    fecha_expiracion = CURRENT_TIMESTAMP + INTERVAL '24 hours';

ALTER TABLE codigos_acceso ALTER COLUMN fecha_emision SET NOT NULL;
ALTER TABLE codigos_acceso ALTER COLUMN fecha_expiracion SET NOT NULL;
