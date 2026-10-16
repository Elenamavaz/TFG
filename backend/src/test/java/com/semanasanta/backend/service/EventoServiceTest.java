package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CancelarProcesionRequest;
import com.semanasanta.backend.dto.EventoRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Prioridad;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.EventoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventoServiceTest {

    @Mock
    private EventoRepository eventoRepository;
    @Mock
    private CofradiaService cofradiaService;
    @Mock
    private UbicacionService ubicacionService;
    @Mock
    private PasoService pasoService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    @Mock
    private NotificacionService notificacionService;

    @InjectMocks
    private EventoService eventoService;

    private static final LocalDateTime FECHA = LocalDateTime.now().plusDays(5);

    private static EventoRequest request(List<Long> cofradiaIds, EstadoEvento estado) {
        return new EventoRequest("Pregón", null, null, FECHA, cofradiaIds, 7L, null, null, FECHA.plusHours(1), estado);
    }

    private static Evento eventoDe(Cofradia cofradia) {
        Evento evento = conId(new Evento("Pregón", null, null, FECHA, null, null), 10L);
        evento.addCofradia(cofradia);
        return evento;
    }

    @Test
    void elListadoDeEventosNoIncluyeLasProcesiones() {
        // Herencia JOINED: el repositorio de Evento devuelve también procesiones.
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        Evento evento = eventoDe(cofradia);
        when(eventoRepository.findAll()).thenReturn(List.of(evento, procesion(11L, cofradia, null)));

        assertThat(eventoService.listar()).containsExactly(evento);
    }

    @Test
    void crearUnEventoGuardaFechasCofradiasYUbicacion() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        Ubicacion ubicacion = new Ubicacion(41.65, -4.72, "Plaza Mayor");
        when(ubicacionService.obtener(7L)).thenReturn(ubicacion);
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L)))
                .thenReturn(new LinkedHashSet<>(List.of(cofradia)));
        when(eventoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Evento creado = eventoService.crear(request(List.of(3L), null));

        assertThat(creado.getFechaFin()).isEqualTo(FECHA.plusHours(1));
        assertThat(creado.getCofradias()).containsExactly(cofradia);
        assertThat(creado.getUbicacion()).isSameAs(ubicacion);
    }

    @Test
    void unEventoNoPuedeMoverseAOtraCiudad() {
        Evento evento = eventoDe(cofradia(3L, ciudad(1L)));
        when(eventoRepository.findById(10L)).thenReturn(Optional.of(evento));
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(4L)))
                .thenReturn(new LinkedHashSet<>(List.of(cofradia(4L, ciudad(2L)))));

        assertThatThrownBy(() -> eventoService.actualizar(10L, request(List.of(4L), null)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(eventoRepository, never()).save(any());
    }

    @Test
    void cancelarUnEventoLoMarcaComoCanceladoYAvisa() {
        Evento evento = eventoDe(cofradia(3L, ciudad(1L)));
        when(eventoRepository.findById(10L)).thenReturn(Optional.of(evento));
        when(eventoRepository.save(evento)).thenReturn(evento);

        eventoService.cancelar(10L, new CancelarProcesionRequest("Suspendido", Prioridad.MEDIA));

        assertThat(evento.getEstado()).isEqualTo(EstadoEvento.CANCELADO);
        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
        verify(notificacionService).crear(any());
    }
}
