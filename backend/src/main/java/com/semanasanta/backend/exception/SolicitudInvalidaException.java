package com.semanasanta.backend.exception;

// Para peticiones bien formadas a nivel de @Valid (tipos correctos, campos
// obligatorios presentes) pero que violan una regla de negocio que las
// anotaciones de bean validation no pueden expresar -p.ej. un campo
// obligatorio solo según el valor de otro campo (ver
// NotificacionService.crear: prioridad obligatoria salvo que tipo sea
// automático, y tipo no puede ser INICIO/FIN por esta vía). Traducida a
// HTTP 400 por GlobalExceptionHandler, igual que los errores de @Valid.
public class SolicitudInvalidaException extends RuntimeException {

    public SolicitudInvalidaException(String mensaje) {
        super(mensaje);
    }
}
