package com.semanasanta.backend.exception;

// Email/contraseña incorrectos, o código de acceso revocado/inexistente.
// Traducida a HTTP 401 por GlobalExceptionHandler.
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}
