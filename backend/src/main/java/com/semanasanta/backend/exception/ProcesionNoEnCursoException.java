package com.semanasanta.backend.exception;

// Ping de un cofrade a una procesión que ya no está EN_CURSO (2026-09-30):
// normalmente porque CambioEstadoAutomaticoService la ha finalizado al
// llegar la hora de fin y al cofrade se le olvidó dejar de compartir. Tiene
// excepción y código propios (410 Gone, ver GlobalExceptionHandler) para
// que la app la distinga de un fallo de red puntual y corte el compartir.
public class ProcesionNoEnCursoException extends RuntimeException {

    public ProcesionNoEnCursoException() {
        super("La procesión ya no está en curso: se ha dejado de compartir tu ubicación");
    }
}
