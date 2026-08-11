package com.semanasanta.backend.exception;

// El usuario está autenticado (a diferencia de CredencialesInvalidasException,
// 401) pero su rol no le permite esta operación. Traducida a HTTP 403.
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
