-- Campo del mockup de "Miembros" (2026-08-17) que faltaba en el backend,
-- mismo patrón que JuntaCofradias.telefono: opcional, nullable.
ALTER TABLE miembros_junta_cofradia ADD COLUMN telefono VARCHAR(50);
