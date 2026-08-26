package com.semanasanta.backend.dto;

// La procesión "en vivo" no es un único punto -es una fila de cofrades que
// puede ocupar varias calles a la vez-, así que en vez de una posición
// media (ver PosicionAgregadaResponse) esto describe un TRAMO del recorrido:
// desde el cofrade que menos ha avanzado (progresoCola) hasta el que más
// (progresoCabeza), ambos como fracción (0..1) de la longitud total del
// recorrido.
//
// Con esto el cliente pinta el recorrido en tres tramos, como la estela de
// Google Maps: de 0 a progresoCola en un color apagado (ya pasado por TODA
// la procesión), de progresoCola a progresoCabeza en un color fuerte (el
// tramo que ocupa la procesión ahora mismo), y de progresoCabeza en
// adelante sin pintar todavía (no ha llegado nadie). El propio recorrido
// completo (para saber por dónde interpolar esas fracciones) ya lo tiene el
// cliente de GET /recorridos/{id}/puntos-ruta.
//
// Ver PosicionActualService.estela.
public record EstelaProcesionResponse(
        double progresoCola,
        double progresoCabeza,
        int cofradesActivos
) {
}
