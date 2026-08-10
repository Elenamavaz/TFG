package com.semanasanta.backend.exception;

// Excepción genérica para "el recurso solicitado no existe", traducida a HTTP 404
// por GlobalExceptionHandler. La reutilizarán todas las entidades, no solo Ciudad.
public class RecursoNoEncontradoException extends RuntimeException {

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}
