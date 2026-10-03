package com.semanasanta.backend.service;

import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.repository.EventoRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

// Primera tarea programada del backend (2026-09-30, decisión de Elena): los
// eventos y procesiones cambian solos de estado al llegar su hora, sin que
// la Junta tenga que acordarse.
// - PROGRAMADO -> EN_CURSO al llegar la hora de inicio (+ notificación INICIO).
// - EN_CURSO -> FINALIZADO al llegar la hora de fin (+ notificación FIN), SIN
//   esperar a que dejen de llegar pings: si a un cofrade se le olvida parar
//   de compartir, a partir de aquí el backend rechaza sus pings y la app le
//   corta (ver CofradeContext). Para alargar, la Junta aumenta la duración.
// - Sin fechaFin, nunca se finaliza solo (queda para hacerlo a mano).
// - CANCELADO y FINALIZADO no se tocan nunca.
// EventoRepository devuelve también las Procesion (herencia JOINED), así que
// una sola consulta cubre los dos.
@Service
public class CambioEstadoAutomaticoService {

    private final EventoRepository eventoRepository;
    private final NotificacionService notificacionService;

    public CambioEstadoAutomaticoService(EventoRepository eventoRepository, NotificacionService notificacionService) {
        this.eventoRepository = eventoRepository;
        this.notificacionService = notificacionService;
    }

    // Cada minuto: la hora de salida se da al minuto, no hace falta más fino.
    // @Transactional porque las cofradías (para saber la ciudad de la
    // notificación) se cargan en diferido, y aquí no hay petición HTTP que
    // mantenga abierta la sesión de Hibernate.
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void actualizarEstados() {
        LocalDateTime ahora = LocalDateTime.now();
        List<Evento> pendientes = eventoRepository.findByEstadoIn(List.of(EstadoEvento.PROGRAMADO, EstadoEvento.EN_CURSO));
        for (Evento evento : pendientes) {
            boolean haTerminado = evento.getFechaFin() != null && !ahora.isBefore(evento.getFechaFin());
            boolean haEmpezado = evento.getMomentoInicio() != null && !ahora.isBefore(evento.getMomentoInicio());

            if (evento.getEstado() == EstadoEvento.PROGRAMADO && haTerminado) {
                // Empezó y acabó sin que el backend estuviera en marcha (o se
                // creó con fechas ya pasadas): se cierra sin avisar, un
                // "ha comenzado" + "ha finalizado" a destiempo solo confunde.
                evento.setEstado(EstadoEvento.FINALIZADO);
                eventoRepository.save(evento);
            } else if (evento.getEstado() == EstadoEvento.PROGRAMADO && haEmpezado) {
                evento.setEstado(EstadoEvento.EN_CURSO);
                notificacionService.notificarCambioDeEstado(eventoRepository.save(evento));
            } else if (evento.getEstado() == EstadoEvento.EN_CURSO && haTerminado) {
                evento.setEstado(EstadoEvento.FINALIZADO);
                notificacionService.notificarCambioDeEstado(eventoRepository.save(evento));
            }
        }
    }
}
