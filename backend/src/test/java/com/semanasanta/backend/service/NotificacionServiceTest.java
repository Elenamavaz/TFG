package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.NotificacionRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.SolicitudInvalidaException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Notificacion;
import com.semanasanta.backend.model.Prioridad;
import com.semanasanta.backend.model.TipoNotificacion;
import com.semanasanta.backend.repository.NotificacionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificacionServiceTest {

    @Mock
    private NotificacionRepository notificacionRepository;
    @Mock
    private CiudadService ciudadService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    @Mock
    private PushNotificacionService pushNotificacionService;

    @InjectMocks
    private NotificacionService notificacionService;

    // --- creación manual por la Junta ---

    @Test
    void laJuntaCreaUnaIncidenciaQueSeGuardaYSeEnviaPorPush() {
        Ciudad ciudad = ciudad(1L);
        when(ciudadService.obtener(1L)).thenReturn(ciudad);
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Notificacion creada = notificacionService.crear(new NotificacionRequest(
                "Cristo de la Luz", "Retraso de 15 minutos", 1L, TipoNotificacion.INCIDENCIA, Prioridad.MEDIA, null));

        assertThat(creada.getTipo()).isEqualTo(TipoNotificacion.INCIDENCIA);
        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
        verify(pushNotificacionService).enviarACiudad(1L, "Incidencia: Cristo de la Luz", "Retraso de 15 minutos");
    }

    @ParameterizedTest
    @EnumSource(value = TipoNotificacion.class, names = {"INICIO", "FIN"})
    void losTiposAutomaticosNoSePuedenCrearAMano(TipoNotificacion tipo) {
        assertThatThrownBy(() -> notificacionService.crear(
                new NotificacionRequest("t", null, 1L, tipo, Prioridad.ALTA, null)))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("lo genera el sistema");
        verifyNoInteractions(notificacionRepository, pushNotificacionService);
    }

    @Test
    void laPrioridadEsObligatoriaEnLasNotificacionesManuales() {
        assertThatThrownBy(() -> notificacionService.crear(
                new NotificacionRequest("t", null, 1L, TipoNotificacion.INCIDENCIA, null, null)))
                .isInstanceOf(SolicitudInvalidaException.class)
                .hasMessageContaining("prioridad");
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeCrearNotificaciones() {
        when(ciudadService.obtener(1L)).thenReturn(ciudad(1L));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> notificacionService.crear(new NotificacionRequest(
                "t", null, 1L, TipoNotificacion.INCIDENCIA, Prioridad.BAJA, LocalDateTime.now().plusDays(1))))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(notificacionRepository, never()).save(any());
        verifyNoInteractions(pushNotificacionService);
    }

    // --- avisos automáticos por cambio de estado ---

    private static Evento eventoEnEstado(EstadoEvento estado) {
        Evento evento = new Evento("Procesión del Encuentro", null, null, LocalDateTime.now(), null, null);
        evento.addCofradia(cofradia(3L, ciudad(1L)));
        evento.setEstado(estado);
        return evento;
    }

    @Test
    void pasarAEnCursoGeneraUnaNotificacionDeInicio() {
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificacionService.notificarCambioDeEstado(eventoEnEstado(EstadoEvento.EN_CURSO));

        ArgumentCaptor<Notificacion> guardada = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository).save(guardada.capture());
        assertThat(guardada.getValue().getTipo()).isEqualTo(TipoNotificacion.INICIO);
        assertThat(guardada.getValue().getCiudad().getId()).isEqualTo(1L);
        verify(pushNotificacionService).enviarACiudad(1L, "Ha comenzado: Procesión del Encuentro", null);
    }

    @Test
    void pasarAFinalizadoGeneraUnaNotificacionDeFin() {
        when(notificacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        notificacionService.notificarCambioDeEstado(eventoEnEstado(EstadoEvento.FINALIZADO));

        ArgumentCaptor<Notificacion> guardada = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository).save(guardada.capture());
        assertThat(guardada.getValue().getTipo()).isEqualTo(TipoNotificacion.FIN);
    }

    @ParameterizedTest
    @EnumSource(value = EstadoEvento.class, names = {"PROGRAMADO", "CANCELADO"})
    void otrosEstadosNoGeneranAvisoAutomatico(EstadoEvento estado) {
        notificacionService.notificarCambioDeEstado(eventoEnEstado(estado));

        verifyNoInteractions(notificacionRepository, pushNotificacionService);
    }

    // --- eliminar ---

    @Test
    void eliminarCompruebaQueEsLaJuntaDeLaCiudad() {
        Notificacion notificacion = conId(new Notificacion(
                "t", null, ciudad(1L), TipoNotificacion.INCIDENCIA, Prioridad.BAJA, null), 10L);
        when(notificacionRepository.findById(10L)).thenReturn(Optional.of(notificacion));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(anyLong());

        assertThatThrownBy(() -> notificacionService.eliminar(10L)).isInstanceOf(AccesoDenegadoException.class);
        verify(notificacionRepository, never()).delete(any());
    }
}
