package com.semanasanta.backend.service;

import com.semanasanta.backend.exception.SolicitudInvalidaException;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;

import java.time.LocalDateTime;

// Reglas de horario compartidas por EventoService, ProcesionService y
// CambioEstadoAutomaticoService (2026-09-30). LocalDateTime.now() es hora de
// España porque BackendApplication fija esa zona por defecto al arrancar
// (Railway corre en UTC).
final class HorarioEventos {

    private HorarioEventos() {
    }

    // Una duración de 0 (fin == inicio) haría que la tarea automática lo
    // pusiera en curso y lo finalizara en el mismo minuto.
    static void validarHorario(LocalDateTime inicio, LocalDateTime fin) {
        if (inicio != null && fin != null && !fin.isAfter(inicio)) {
            throw new SolicitudInvalidaException("La hora de fin debe ser posterior a la de inicio (revisa la duración)");
        }
    }

    // Cambio de estado a mano desde el formulario de edición (procesión o
    // evento). null o el mismo estado = no cambia nada. Devuelve si cambió,
    // para que quien llama avise a los ciudadanos después de guardar.
    // CANCELADO sí se admite (2026-10-02, Elena lo añadió al selector): se
    // cancela sin avisar todavía -la app abre a continuación "Crear
    // Notificación" con la cancelación ya elegida para dar el motivo.
    static boolean aplicarEstadoManual(Evento evento, EstadoEvento nuevo) {
        if (nuevo == null || nuevo == evento.getEstado()) {
            return false;
        }
        validarEstadoManual(evento, nuevo);
        evento.setEstado(nuevo);
        return true;
    }

    // Un cambio de estado a mano que la tarea automática desharía en el
    // siguiente minuto se rechaza aquí, con el motivo, en vez de dejar que
    // "rebote" sin que la Junta entienda por qué: para retrasar o alargar,
    // se cambia la hora, no el estado.
    static void validarEstadoManual(Evento evento, EstadoEvento nuevo) {
        LocalDateTime ahora = LocalDateTime.now();
        if (nuevo == EstadoEvento.PROGRAMADO && !ahora.isBefore(evento.getMomentoInicio())) {
            throw new SolicitudInvalidaException(
                    "La hora de inicio ya ha pasado: para retrasarla, cambia la hora de salida");
        }
        if (nuevo == EstadoEvento.EN_CURSO && evento.getFechaFin() != null && !ahora.isBefore(evento.getFechaFin())) {
            throw new SolicitudInvalidaException(
                    "La hora de fin ya ha pasado: para alargarla, aumenta la duración");
        }
    }
}
