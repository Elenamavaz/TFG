package com.semanasanta.backend.dto;

import com.semanasanta.backend.model.PosicionActual;

import java.time.LocalDateTime;

// Un ping individual (histórico). Para el valor calculado "posición actual
// de la procesión ahora mismo", ver PosicionAgregadaResponse.
// guardado=false: el ping se recibió pero caía fuera del recorrido marcado y
// no se ha guardado nada (ver PosicionActualService.registrarPing) -id y
// timestamp van a null en ese caso, no hay fila real detrás.
public record PosicionActualResponse(
        Long id,
        Double latitud,
        Double longitud,
        LocalDateTime timestamp,
        Long procesionId,
        boolean guardado
) {
    public static PosicionActualResponse from(PosicionActual posicionActual) {
        return new PosicionActualResponse(
                posicionActual.getId(),
                posicionActual.getLatitud(),
                posicionActual.getLongitud(),
                posicionActual.getTimestamp(),
                posicionActual.getProcesion().getId(),
                true
        );
    }

    // Ping descartado por caer fuera del recorrido: se responde igualmente
    // (200, no 201/error) porque el cliente lo manda solo, automáticamente,
    // cada ~30s en segundo plano -no tiene sentido tratar un GPS con deriva
    // como un fallo (decisión del 2026-08-22, ver PosicionActualService).
    public static PosicionActualResponse descartadoFueraDeRecorrido(Long procesionId, Double latitud, Double longitud) {
        return new PosicionActualResponse(null, latitud, longitud, null, procesionId, false);
    }
}
