package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CancelarProcesionRequest;
import com.semanasanta.backend.dto.NotificacionRequest;
import com.semanasanta.backend.dto.ProcesionRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.exception.SolicitudInvalidaException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Prioridad;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.model.TipoNotificacion;
import com.semanasanta.backend.repository.ProcesionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProcesionServiceTest {

    @Mock
    private ProcesionRepository procesionRepository;
    @Mock
    private CofradiaService cofradiaService;
    @Mock
    private UbicacionService ubicacionService;
    @Mock
    private RecorridoService recorridoService;
    @Mock
    private PasoService pasoService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    @Mock
    private NotificacionService notificacionService;

    @InjectMocks
    private ProcesionService procesionService;

    private static final LocalDateTime INICIO = LocalDateTime.now().plusDays(10);

    private static ProcesionRequest request(List<Long> cofradiaIds, Long recorridoId, LocalDateTime fin,
                                            EstadoEvento estado) {
        return new ProcesionRequest("Procesión General", null, null, INICIO, cofradiaIds, null, null,
                INICIO, fin, recorridoId, null, estado);
    }

    private static Set<Cofradia> conjunto(Cofradia... cofradias) {
        return new LinkedHashSet<>(List.of(cofradias));
    }

    // --- crear ---

    @Test
    void crearUnaProcesionAsignaCofradiasYRecorrido() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L))).thenReturn(conjunto(cofradia));
        when(recorridoService.obtener(20L)).thenReturn(recorrido(20L));
        when(procesionRepository.existsByRecorridoId(20L)).thenReturn(false);
        when(procesionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Procesion creada = procesionService.crear(request(List.of(3L), 20L, INICIO.plusHours(3), null));

        assertThat(creada.getCofradias()).containsExactly(cofradia);
        assertThat(creada.getRecorrido().getId()).isEqualTo(20L);
        assertThat(creada.getEstado()).isEqualTo(EstadoEvento.PROGRAMADO);
    }

    @Test
    void noSePuedeCrearConLaHoraDeFinAnteriorAlInicio() {
        assertThatThrownBy(() -> procesionService.crear(request(List.of(3L), null, INICIO.minusHours(1), null)))
                .isInstanceOf(SolicitudInvalidaException.class);
        verify(procesionRepository, never()).save(any());
    }

    @Test
    void unRecorridoNoPuedeAsignarseADosProcesiones() {
        when(recorridoService.obtener(20L)).thenReturn(recorrido(20L));
        when(procesionRepository.existsByRecorridoId(20L)).thenReturn(true);

        assertThatThrownBy(() -> procesionService.crear(request(List.of(3L), 20L, null, null)))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void crearConCofradiasDeOtraJuntaSeRechaza() {
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L)))
                .thenThrow(new AccesoDenegadoException("otra ciudad"));

        assertThatThrownBy(() -> procesionService.crear(request(List.of(3L), null, null, null)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(procesionRepository, never()).save(any());
    }

    // --- actualizar ---

    @Test
    void actualizarConservaElMismoRecorridoSinConsiderarloDuplicado() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        Procesion procesion = procesion(10L, cofradia, recorrido(20L));
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L))).thenReturn(conjunto(cofradia));
        when(recorridoService.obtener(20L)).thenReturn(procesion.getRecorrido());
        when(procesionRepository.save(procesion)).thenReturn(procesion);

        procesionService.actualizar(10L, request(List.of(3L), 20L, INICIO.plusHours(2), null));

        verify(procesionRepository, never()).existsByRecorridoId(any());
        assertThat(procesion.getFechaFin()).isEqualTo(INICIO.plusHours(2));
    }

    @Test
    void unaProcesionNoPuedeMoverseAOtraCiudad() {
        Procesion procesion = procesion(10L, cofradia(3L, ciudad(1L)), null);
        Cofradia deOtraCiudad = cofradia(4L, ciudad(2L));
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(4L))).thenReturn(conjunto(deOtraCiudad));

        assertThatThrownBy(() -> procesionService.actualizar(10L, request(List.of(4L), null, null, null)))
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("otra ciudad");
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeEditarLaProcesion() {
        Procesion procesion = procesion(10L, cofradia(3L, ciudad(1L)), null);
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> procesionService.actualizar(10L, request(List.of(3L), null, null, null)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(procesionRepository, never()).save(any());
    }

    @Test
    void cambiarElEstadoAManoAvisaALosCiudadanos() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        Procesion procesion = procesion(10L, cofradia, null);
        procesion.setEstado(EstadoEvento.EN_CURSO);
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L))).thenReturn(conjunto(cofradia));
        when(procesionRepository.save(procesion)).thenReturn(procesion);

        procesionService.actualizar(10L, request(List.of(3L), null, INICIO.plusHours(3), EstadoEvento.FINALIZADO));

        assertThat(procesion.getEstado()).isEqualTo(EstadoEvento.FINALIZADO);
        verify(notificacionService).notificarCambioDeEstado(procesion);
    }

    @Test
    void sinCambioDeEstadoNoSeAvisa() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        Procesion procesion = procesion(10L, cofradia, null);
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));
        when(cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L))).thenReturn(conjunto(cofradia));
        when(procesionRepository.save(procesion)).thenReturn(procesion);

        procesionService.actualizar(10L, request(List.of(3L), null, null, null));

        verify(notificacionService, never()).notificarCambioDeEstado(any());
    }

    // --- cancelar / eliminar ---

    @Test
    void cancelarCambiaElEstadoYCreaUnaNotificacionDeCancelacion() {
        Ciudad ciudad = ciudad(1L);
        Procesion procesion = procesion(10L, cofradia(3L, ciudad), null);
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));
        when(procesionRepository.save(procesion)).thenReturn(procesion);

        procesionService.cancelar(10L, new CancelarProcesionRequest("Por lluvia", Prioridad.ALTA));

        assertThat(procesion.getEstado()).isEqualTo(EstadoEvento.CANCELADO);
        ArgumentCaptor<NotificacionRequest> aviso = ArgumentCaptor.forClass(NotificacionRequest.class);
        verify(notificacionService).crear(aviso.capture());
        assertThat(aviso.getValue().tipo()).isEqualTo(TipoNotificacion.CANCELACION);
        assertThat(aviso.getValue().mensaje()).isEqualTo("Por lluvia");
        assertThat(aviso.getValue().ciudadId()).isEqualTo(1L);
        assertThat(aviso.getValue().prioridad()).isEqualTo(Prioridad.ALTA);
    }

    @Test
    void eliminarCompruebaLaJuntaDeLaCiudadAntesDeBorrar() {
        Procesion procesion = procesion(10L, cofradia(3L, ciudad(1L)), null);
        when(procesionRepository.findById(10L)).thenReturn(Optional.of(procesion));

        procesionService.eliminar(10L);

        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
        verify(procesionRepository).delete(procesion);
    }

    @Test
    void obtenerUnaProcesionInexistenteDevuelve404() {
        when(procesionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> procesionService.obtener(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void guardarProgresoEstelaActualizaLaMarcaDeAgua() {
        Procesion procesion = procesion(10L, cofradia(3L, ciudad(1L)), null);

        procesionService.guardarProgresoEstela(procesion, 0.2, 0.6);

        assertThat(procesion.getProgresoColaAlcanzado()).isEqualTo(0.2);
        assertThat(procesion.getProgresoCabezaAlcanzado()).isEqualTo(0.6);
        verify(procesionRepository).save(procesion);
    }
}
