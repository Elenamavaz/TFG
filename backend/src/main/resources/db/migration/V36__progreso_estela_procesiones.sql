-- Marca de agua del progreso de la "estela" en vivo (2026-08-22, a petición
-- de Elena, ver PosicionActualService.estela): hasta dónde ha llegado ya el
-- cofrade más atrasado (progreso_cola_alcanzado) y el más adelantado
-- (progreso_cabeza_alcanzado) de la procesión, como fracción 0..1 de la
-- longitud del recorrido. Solo AVANZAN -nunca se guarda un valor menor que
-- el que ya había-, así que un corte de cobertura puntual de un cofrade no
-- hace retroceder ni saltar la estela pintada en el mapa. NULL hasta que
-- llegue el primer ping de la procesión.
ALTER TABLE procesiones ADD COLUMN progreso_cola_alcanzado DOUBLE PRECISION;
ALTER TABLE procesiones ADD COLUMN progreso_cabeza_alcanzado DOUBLE PRECISION;
