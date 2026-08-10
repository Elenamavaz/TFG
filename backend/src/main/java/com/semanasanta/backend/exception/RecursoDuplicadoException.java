package com.semanasanta.backend.exception;

// Para violaciones de reglas de unicidad de negocio (p.ej. una ciudad que ya
// tiene Junta de Cofradías), traducida a HTTP 409 por GlobalExceptionHandler.
public class RecursoDuplicadoException extends RuntimeException {

    public RecursoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
