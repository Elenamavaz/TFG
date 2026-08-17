-- Se quita "numero_cofradias_estimado" (añadido en V25 el mismo día): Elena
-- decidió que no aportaba nada -el número real de cofradías ya se puede ver
-- en vivo contando GET /cofradias?ciudadId=, un campo aparte solo podía
-- quedar desactualizado. No se edita V25 directamente porque ya pudo
-- aplicarse en bases de datos existentes -las migraciones no se tocan una
-- vez creadas, se corrigen con una nueva.
ALTER TABLE ciudades DROP COLUMN numero_cofradias_estimado;
