package com.semanasanta.backend.exception;

// Para archivos subidos por el usuario que no se pueden procesar (GPX mal
// formado, vacío, sin puntos de ruta...) -no es un 404 (no falta ningún
// recurso), ni un 409 (no choca con nada ya guardado): es que el propio
// archivo no vale. Traducida a HTTP 400 por GlobalExceptionHandler, igual
// que los errores de @Valid.
public class ArchivoInvalidoException extends RuntimeException {

    public ArchivoInvalidoException(String mensaje) {
        super(mensaje);
    }
}
