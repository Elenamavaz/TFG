package com.semanasanta.backend.service;

import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.repository.EventoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// La tarea programada que cada 30 segundos pasa eventos/procesiones a EN_CURSO o
// FINALIZADO según su hora. Se prueba llamando directamente al método, sin
// esperar al @Scheduled.
@ExtendWith(MockitoExtension.class)
class CambioEstadoAutomaticoServiceTest {

    @Mock
    private EventoRepository eventoRepository;
    @Mock
    private NotificacionService notificacionService;

    @InjectMocks
    private CambioEstadoAutomaticoService servicio;

    private static Evento evento(LocalDateTime inicio, LocalDateTime fin, EstadoEvento estado) {
        Evento evento = new Evento("Evento", null, null, inicio, null, null);
        evento.setFechaFin(fin);
        evento.setEstado(estado);
        return evento;
    }

    private void ejecutarCon(Evento evento) {
        when(eventoRepository.findByEstadoIn(List.of(EstadoEvento.PROGRAMADO, EstadoEvento.EN_CURSO)))
                .thenReturn(List.of(evento));
        servicio.actualizarEstados();
    }

    @Test
    void unEventoProgramadoQueYaHaEmpezadoPasaAEnCursoYAvisa() {
        LocalDateTime ahora = LocalDateTime.now();
        Evento evento = evento(ahora.minusMinutes(1), ahora.plusHours(2), EstadoEvento.PROGRAMADO);
        when(eventoRepository.save(evento)).thenReturn(evento);

        ejecutarCon(evento);

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.EN_CURSO);
        verify(notificacionService).notificarCambioDeEstado(evento);
    }

    @Test
    void unEventoEnCursoQueHaLlegadoASuFinPasaAFinalizadoYAvisa() {
        LocalDateTime ahora = LocalDateTime.now();
        Evento evento = evento(ahora.minusHours(3), ahora.minusMinutes(1), EstadoEvento.EN_CURSO);
        when(eventoRepository.save(evento)).thenReturn(evento);

        ejecutarCon(evento);

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.FINALIZADO);
        verify(notificacionService).notificarCambioDeEstado(evento);
    }

    @Test
    void unEventoProgramadoCuyoFinYaPasoSeFinalizaSinAvisar() {
        // P.ej. el servidor estuvo apagado durante todo el evento: avisar
        // "ha comenzado" y "ha finalizado" a destiempo solo confundiría.
        LocalDateTime ahora = LocalDateTime.now();
        Evento evento = evento(ahora.minusHours(3), ahora.minusHours(1), EstadoEvento.PROGRAMADO);

        ejecutarCon(evento);

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.FINALIZADO);
        verify(eventoRepository).save(evento);
        verify(notificacionService, never()).notificarCambioDeEstado(any());
    }

    @Test
    void unEventoProgramadoQueAunNoHaEmpezadoNoCambia() {
        LocalDateTime ahora = LocalDateTime.now();
        Evento evento = evento(ahora.plusHours(1), ahora.plusHours(3), EstadoEvento.PROGRAMADO);

        ejecutarCon(evento);

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.PROGRAMADO);
        verify(eventoRepository, never()).save(any());
    }

    @Test
    void unEventoEnCursoSinHoraDeFinNuncaSeFinalizaSolo() {
        Evento evento = evento(LocalDateTime.now().minusDays(1), null, EstadoEvento.EN_CURSO);

        ejecutarCon(evento);

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.EN_CURSO);
        verify(eventoRepository, never()).save(any());
    }

    @Test
    void sinEventosPendientesNoHaceNada() {
        when(eventoRepository.findByEstadoIn(any())).thenReturn(List.of());

        servicio.actualizarEstados();

        verify(eventoRepository, never()).save(any());
        verify(notificacionService, never()).notificarCambioDeEstado(any());
    }
}
