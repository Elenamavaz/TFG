package com.semanasanta.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import tools.jackson.core.JacksonException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.LinkedHashMap;
import java.util.Map;

// Centraliza la traducción de excepciones a respuestas HTTP para todos los
// controladores, no solo Ciudad.
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(String mensaje) {
    }

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNoEncontrado(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ErrorResponse> handleCredencialesInvalidas(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ErrorResponse> handleAccesoDenegado(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(RecursoDuplicadoException.class)
    public ResponseEntity<ErrorResponse> handleDuplicado(RecursoDuplicadoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(ArchivoInvalidoException.class)
    public ResponseEntity<ErrorResponse> handleArchivoInvalido(ArchivoInvalidoException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(SolicitudInvalidaException.class)
    public ResponseEntity<ErrorResponse> handleSolicitudInvalida(SolicitudInvalidaException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(ex.getMessage()));
    }

    // Ping a una procesión que ya no está en curso (2026-09-30, ver
    // ProcesionNoEnCursoException): 410 Gone, código propio para que la app
    // del cofrade deje de compartir en vez de reintentar.
    @ExceptionHandler(ProcesionNoEnCursoException.class)
    public ResponseEntity<ErrorResponse> handleProcesionNoEnCurso(ProcesionNoEnCursoException ex) {
        return ResponseEntity.status(HttpStatus.GONE).body(new ErrorResponse(ex.getMessage()));
    }

    // Estado inválido para la operación pedida (p.ej. actualizar ubicación sin
    // haber empezado a compartir antes). 409, igual que un recurso duplicado:
    // la petición está bien formada, pero choca con el estado actual.
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleEstadoInvalido(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(ex.getMessage()));
    }

    // Red de seguridad para lo que choca con una restricción de la base de
    // datos sin que ningún Service lo haya comprobado antes -sobre todo
    // eliminar algo que aún tiene datos asociados (una cofradía con pasos,
    // una Junta con miembros...): 409 con un mensaje entendible en vez de un
    // 500 genérico.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleIntegridad(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(
                "No se puede eliminar porque todavía tiene datos asociados (por ejemplo pasos, eventos, "
                        + "procesiones, códigos de acceso o miembros). Elimínalos primero."));
    }

    // Errores de FORMATO de la petición (bug 11 de bugs.md, 2026-10-16): una
    // fecha sin hora, un enum que no existe, un JSON mal formado... No los
    // traducía nadie y Spring respondía con su cuerpo por defecto, sin
    // "mensaje": la app lo tomaba por errores de campos y mostraba "Revisa
    // los campos marcados." sin marcar ninguno.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleCuerpoIlegible(HttpMessageNotReadableException ex) {
        String campo = campoConError(ex);
        String mensaje = campo != null
                ? "El campo \"" + campo + "\" no tiene un formato válido."
                : "Los datos enviados no tienen un formato válido.";
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse(mensaje));
    }

    // Jackson (3.x, tools.jackson) deja en la excepción la ruta hasta el
    // valor que no ha podido leer; el último nombre de propiedad es el campo.
    // null si no hay ruta (p.ej. JSON mal formado de raíz).
    private static String campoConError(Throwable ex) {
        for (Throwable causa = ex; causa != null; causa = causa.getCause()) {
            if (causa instanceof JacksonException jackson) {
                String campo = null;
                for (JacksonException.Reference referencia : jackson.getPath()) {
                    if (referencia.getPropertyName() != null) {
                        campo = referencia.getPropertyName();
                    }
                }
                return campo;
            }
        }
        return null;
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleParametroInvalido(MethodArgumentTypeMismatchException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("El parámetro \"" + ex.getName() + "\" no tiene un formato válido."));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleParametroAusente(MissingServletRequestParameterException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("Falta el parámetro \"" + ex.getParameterName() + "\"."));
    }

    // GPX enorme (p.ej. un track de horas grabado con el móvil).
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleArchivoDemasiadoGrande(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE)
                .body(new ErrorResponse("El archivo es demasiado grande."));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.put(error.getField(), error.getDefaultMessage());
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errores);
    }
}
