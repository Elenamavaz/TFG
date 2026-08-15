-- Hueco detectado el 2026-08-14 diseñando la interfaz de alta de un Miembro
-- de Junta: el Administrador introduce nombre, email y contraseña, no solo
-- email y contraseña -el nombre hace falta para el correo de bienvenida que
-- le envía el sistema con esa contraseña (ver MiembroJuntaCofradiaService).
-- Columna propia del subtipo, no de "usuarios": mismo patrón que
-- junta_cofradias_id en V16, el Administrador (V17) no la necesita.
ALTER TABLE miembros_junta_cofradia
    ADD COLUMN nombre VARCHAR(255) NOT NULL;
