package com.semanasanta.backend.service;

import com.semanasanta.backend.exception.SolicitudInvalidaException;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// HorarioEventos es package-private: por eso este test vive en el mismo
// paquete (com.semanasanta.backend.service).
class HorarioEventosTest {

    private static Evento evento(LocalDateTime inicio, LocalDateTime fin, EstadoEvento estado) {
        Evento evento = new Evento("Prueba", null, null, inicio, null, null);
        evento.setFechaFin(fin);
        evento.setEstado(estado);
        return evento;
    }

    // --- validarHorario ---

    @Test
    void aceptaFinPosteriorAlInicio() {
        LocalDateTime inicio = LocalDateTime.of(2026, 4, 2, 20, 0);

        assertThatCode(() -> HorarioEventos.validarHorario(inicio, inicio.plusHours(3)))
                .doesNotThrowAnyException();
    }

    @Test
    void rechazaFinIgualAlInicio() {
        LocalDateTime inicio = LocalDateTime.of(2026, 4, 2, 20, 0);

        assertThatThrownBy(() -> HorarioEventos.validarHorario(inicio, inicio))
                .isInstanceOf(SolicitudInvalidaException.class);
    }

    @Test
    void rechazaFinAnteriorAlInicio() {
        LocalDateTime inicio = LocalDateTime.of(2026, 4, 2, 20, 0);

        assertThatThrownBy(() -> HorarioEventos.validarHorario(inicio, inicio.minusMinutes(1)))
                .isInstanceOf(SolicitudInvalidaException.class);
    }

    @Test
    void sinFinNoValidaNada() {
        assertThatCode(() -> HorarioEventos.validarHorario(LocalDateTime.now(), null))
                .doesNotThrowAnyException();
    }

    // --- aplicarEstadoManual ---

    @Test
    void mismoEstadoONuloNoCambiaNada() {
        Evento evento = evento(LocalDateTime.now().plusDays(1), null, EstadoEvento.PROGRAMADO);

        assertThat(HorarioEventos.aplicarEstadoManual(evento, null)).isFalse();
        assertThat(HorarioEventos.aplicarEstadoManual(evento, EstadoEvento.PROGRAMADO)).isFalse();
        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.PROGRAMADO);
    }

    @Test
    void cancelarUnEventoProgramadoCambiaElEstado() {
        Evento evento = evento(LocalDateTime.now().plusDays(1), null, EstadoEvento.PROGRAMADO);

        assertThat(HorarioEventos.aplicarEstadoManual(evento, EstadoEvento.CANCELADO)).isTrue();
        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.CANCELADO);
    }

    @Test
    void noPermiteVolverAProgramadoSiElInicioYaPaso() {
        Evento evento = evento(LocalDateTime.now().minusHours(1), null, EstadoEvento.EN_CURSO);

        assertThatThrownBy(() -> HorarioEventos.aplicarEstadoManual(evento, EstadoEvento.PROGRAMADO))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("hora de inicio ya ha pasado");
        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.EN_CURSO);
    }

    @Test
    void noPermitePonerEnCursoSiElFinYaPaso() {
        LocalDateTime ahora = LocalDateTime.now();
        Evento evento = evento(ahora.minusHours(3), ahora.minusHours(1), EstadoEvento.FINALIZADO);

        assertThatThrownBy(() -> HorarioEventos.aplicarEstadoManual(evento, EstadoEvento.EN_CURSO))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("hora de fin ya ha pasado");
    }

    @Test
    void permitePonerEnCursoUnEventoQueAunNoHaTerminado() {
        LocalDateTime ahora = LocalDateTime.now();
        Evento evento = evento(ahora.minusHours(1), ahora.plusHours(2), EstadoEvento.PROGRAMADO);

        assertThat(HorarioEventos.aplicarEstadoManual(evento, EstadoEvento.EN_CURSO)).isTrue();
        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.EN_CURSO);
    }
}
