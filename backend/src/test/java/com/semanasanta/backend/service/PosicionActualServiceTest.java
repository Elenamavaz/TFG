package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.EstelaProcesionResponse;
import com.semanasanta.backend.dto.PosicionActualResponse;
import com.semanasanta.backend.dto.PosicionAgregadaResponse;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.ProcesionNoEnCursoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.PosicionActual;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.repository.PosicionActualRepository;
import com.semanasanta.backend.util.GeometriaRuta.PuntoGeo;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Seguimiento GPS en vivo: pings de los cofrades, posición media y estela.
// Recorrido de prueba: línea recta de ~222 m hacia el norte en Valladolid.
@ExtendWith(MockitoExtension.class)
class PosicionActualServiceTest {

    private static final double LON = -4.72;
    private static final List<PuntoGeo> RUTA = List.of(
            new PuntoGeo(41.650, LON), new PuntoGeo(41.651, LON), new PuntoGeo(41.652, LON));

    private static final Long COFRADIA_PARTICIPANTE = 3L;

    @Mock
    private PosicionActualRepository posicionActualRepository;
    @Mock
    private ProcesionService procesionService;
    @Mock
    private RecorridoPuntoRutaService recorridoPuntoRutaService;

    @InjectMocks
    private PosicionActualService servicio;

    private Procesion procesion;

    @BeforeEach
    void preparar() {
        procesion = procesion(10L, cofradia(COFRADIA_PARTICIPANTE, ciudad(1L)), recorrido(20L));
        procesion.setEstado(EstadoEvento.EN_CURSO);
        when(procesionService.obtener(10L)).thenReturn(procesion);
    }

    @AfterEach
    void limpiar() {
        cerrarSesion();
    }

    // --- registrar ping ---

    @Test
    void unCofradeParticipanteRegistraUnPingSobreElRecorrido() {
        autenticarComo(COFRADIA_PARTICIPANTE, "COFRADE");
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);
        when(posicionActualRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        PosicionActualResponse respuesta = servicio.registrarPing(10L, 41.651, LON);

        assertThat(respuesta.guardado()).isTrue();
        assertThat(respuesta.procesionId()).isEqualTo(10L);
    }

    @Test
    void unPingLejosDelRecorridoSeDescartaSinGuardarse() {
        autenticarComo(COFRADIA_PARTICIPANTE, "COFRADE");
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);

        // 0.002º de longitud a esta latitud son ~166 m: muy por encima de los 50 m de margen.
        PosicionActualResponse respuesta = servicio.registrarPing(10L, 41.651, LON + 0.002);

        assertThat(respuesta.guardado()).isFalse();
        verify(posicionActualRepository, never()).save(any());
    }

    @Test
    void unPingCercanoAlRecorridoDentroDelMargenSeGuarda() {
        autenticarComo(COFRADIA_PARTICIPANTE, "COFRADE");
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);
        when(posicionActualRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // 0.0003º de longitud son ~25 m: el cofrade va por la acera.
        PosicionActualResponse respuesta = servicio.registrarPing(10L, 41.651, LON + 0.0003);

        assertThat(respuesta.guardado()).isTrue();
    }

    @Test
    void sinRecorridoAsignadoSeAceptaCualquierPing() {
        procesion.setRecorrido(null);
        autenticarComo(COFRADIA_PARTICIPANTE, "COFRADE");
        when(posicionActualRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        assertThat(servicio.registrarPing(10L, 40.0, -3.0).guardado()).isTrue();
    }

    @Test
    void unCofradeDeOtraCofradiaNoPuedeEnviarPings() {
        autenticarComo(99L, "COFRADE");

        assertThatThrownBy(() -> servicio.registrarPing(10L, 41.651, LON))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(posicionActualRepository, never()).save(any());
    }

    @Test
    void unaJuntaNoPuedeEnviarPingsAunqueSuIdCoincida() {
        autenticarComo(COFRADIA_PARTICIPANTE, "JUNTA");

        assertThatThrownBy(() -> servicio.registrarPing(10L, 41.651, LON))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @ParameterizedTest
    @EnumSource(value = EstadoEvento.class, names = {"PROGRAMADO", "FINALIZADO", "CANCELADO"})
    void soloSeAceptanPingsMientrasLaProcesionEstaEnCurso(EstadoEvento estado) {
        procesion.setEstado(estado);
        autenticarComo(COFRADIA_PARTICIPANTE, "COFRADE");

        assertThatThrownBy(() -> servicio.registrarPing(10L, 41.651, LON))
                .isInstanceOf(ProcesionNoEnCursoException.class);
        verify(posicionActualRepository, never()).save(any());
    }

    // --- posición actual (media de pings recientes) ---

    @Test
    void laPosicionActualEsLaMediaDeLosPingsRecientes() {
        when(posicionActualRepository.findByProcesionIdAndTimestampAfter(eq(10L), any())).thenReturn(List.of(
                new PosicionActual(41.650, -4.720, procesion),
                new PosicionActual(41.652, -4.722, procesion)));

        PosicionAgregadaResponse actual = servicio.actual(10L);

        assertThat(actual.latitud()).isCloseTo(41.651, within(1e-9));
        assertThat(actual.longitud()).isCloseTo(-4.721, within(1e-9));
        assertThat(actual.cofradesActivos()).isEqualTo(2);
    }

    @Test
    void sinPingsRecientesNoHayPosicionActual() {
        when(posicionActualRepository.findByProcesionIdAndTimestampAfter(eq(10L), any())).thenReturn(List.of());

        assertThatThrownBy(() -> servicio.actual(10L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    // --- estela (tramo ocupado por la procesión) ---

    @Test
    void laEstelaVaDelPingMasRetrasadoAlMasAdelantado() {
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);
        when(posicionActualRepository.findByProcesionIdAndTimestampAfter(eq(10L), any())).thenReturn(List.of(
                new PosicionActual(41.6505, LON, procesion),   // cola: 25 %
                new PosicionActual(41.6515, LON, procesion))); // cabeza: 75 %
        guardarProgresoDeVerdad();

        EstelaProcesionResponse estela = servicio.estela(10L);

        assertThat(estela.progresoCola()).isCloseTo(0.25, within(0.01));
        assertThat(estela.progresoCabeza()).isCloseTo(0.75, within(0.01));
        assertThat(estela.cofradesActivos()).isEqualTo(2);
    }

    @Test
    void laEstelaNuncaRetrocedeAunqueLlegueUnPingMasAtrasado() {
        procesion.setProgresoColaAlcanzado(0.5);
        procesion.setProgresoCabezaAlcanzado(0.9);
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);
        when(posicionActualRepository.findByProcesionIdAndTimestampAfter(eq(10L), any())).thenReturn(List.of(
                new PosicionActual(41.6502, LON, procesion))); // 10 %
        guardarProgresoDeVerdad();

        EstelaProcesionResponse estela = servicio.estela(10L);

        assertThat(estela.progresoCola()).isEqualTo(0.5);
        assertThat(estela.progresoCabeza()).isEqualTo(0.9);
    }

    @Test
    void sinPingsRecientesLaEstelaMantieneElUltimoValorConocido() {
        procesion.setProgresoColaAlcanzado(0.3);
        procesion.setProgresoCabezaAlcanzado(0.6);
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);
        when(posicionActualRepository.findByProcesionIdAndTimestampAfter(eq(10L), any())).thenReturn(List.of());

        EstelaProcesionResponse estela = servicio.estela(10L);

        assertThat(estela.progresoCola()).isEqualTo(0.3);
        assertThat(estela.progresoCabeza()).isEqualTo(0.6);
        verify(procesionService, never()).guardarProgresoEstela(any(), anyDouble(), anyDouble());
    }

    @Test
    void sinRecorridoNoHayEstela() {
        procesion.setRecorrido(null);

        assertThatThrownBy(() -> servicio.estela(10L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("no tiene recorrido");
    }

    @Test
    void sinNingunPingTodaviaNoHayEstela() {
        when(recorridoPuntoRutaService.puntosGeo(20L)).thenReturn(RUTA);
        when(posicionActualRepository.findByProcesionIdAndTimestampAfter(eq(10L), any())).thenReturn(List.of());

        assertThatThrownBy(() -> servicio.estela(10L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    // ProcesionService es un mock: se le hace aplicar de verdad el progreso
    // sobre la procesión para que estela() lea el valor actualizado.
    private void guardarProgresoDeVerdad() {
        doAnswer(inv -> {
            Procesion p = inv.getArgument(0);
            p.setProgresoColaAlcanzado(inv.getArgument(1));
            p.setProgresoCabezaAlcanzado(inv.getArgument(2));
            return null;
        }).when(procesionService).guardarProgresoEstela(any(), anyDouble(), anyDouble());
    }
}
