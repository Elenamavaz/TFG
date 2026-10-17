package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.MarcarPuntoDeInteresRequest;
import com.semanasanta.backend.dto.PuntoDeInteresRequest;
import com.semanasanta.backend.dto.PuntoEnRecorridoRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.model.TipoPuntoInteres;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import com.semanasanta.backend.util.GeometriaRuta.PuntoGeo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecorridoPuntoRutaServiceTest {

    @Mock
    private RecorridoPuntoRutaRepository repositorio;
    @Mock
    private RecorridoService recorridoService;
    @Mock
    private PuntoRutaService puntoRutaService;
    @Mock
    private PuntoDeInteresService puntoDeInteresService;
    @Mock
    private AutorizacionRecorridoService autorizacionRecorridoService;
    @Mock
    private PuntoRutaRepository puntoRutaRepository;

    @InjectMocks
    private RecorridoPuntoRutaService servicio;

    private static PuntoRuta punto(Long id, double lat, double lon) {
        return conId(new PuntoRuta(conId(new Ubicacion(lat, lon, null), id)), id);
    }

    @Test
    void puntosGeoDevuelveLasCoordenadasEnElOrdenDelRecorrido() {
        Recorrido recorrido = recorrido(20L);
        when(recorridoService.obtener(20L)).thenReturn(recorrido);
        when(repositorio.findByRecorridoIdOrderByOrdenAsc(20L)).thenReturn(List.of(
                new RecorridoPuntoRuta(recorrido, punto(1L, 41.64, -4.72), 0, null),
                new RecorridoPuntoRuta(recorrido, punto(2L, 41.65, -4.73), 1, null)));

        assertThat(servicio.puntosGeo(20L)).containsExactly(
                new PuntoGeo(41.64, -4.72), new PuntoGeo(41.65, -4.73));
    }

    @Test
    void agregarUnPuntoAlRecorridoEnUnaPosicionLibre() {
        when(recorridoService.obtener(20L)).thenReturn(recorrido(20L));
        when(puntoRutaService.obtener(1L)).thenReturn(punto(1L, 41.64, -4.72));
        when(repositorio.existsByRecorridoIdAndPuntoRutaId(20L, 1L)).thenReturn(false);
        when(repositorio.existsByRecorridoIdAndOrden(20L, 3)).thenReturn(false);
        when(repositorio.save(any())).thenAnswer(inv -> inv.getArgument(0));

        RecorridoPuntoRuta relacion = servicio.agregar(20L, new PuntoEnRecorridoRequest(1L, 3, null));

        verify(autorizacionRecorridoService).exigirPuedeEditarRecorrido(20L);
        assertThat(relacion.getOrden()).isEqualTo(3);
    }

    @Test
    void unPuntoNoPuedeEstarDosVecesEnElMismoRecorrido() {
        when(recorridoService.obtener(20L)).thenReturn(recorrido(20L));
        when(puntoRutaService.obtener(1L)).thenReturn(punto(1L, 41.64, -4.72));
        when(repositorio.existsByRecorridoIdAndPuntoRutaId(20L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> servicio.agregar(20L, new PuntoEnRecorridoRequest(1L, 3, null)))
                .isInstanceOf(RecursoDuplicadoException.class);
        verify(repositorio, never()).save(any());
    }

    @Test
    void dosPuntosNoPuedenOcuparLaMismaPosicion() {
        when(recorridoService.obtener(20L)).thenReturn(recorrido(20L));
        when(puntoRutaService.obtener(1L)).thenReturn(punto(1L, 41.64, -4.72));
        when(repositorio.existsByRecorridoIdAndPuntoRutaId(20L, 1L)).thenReturn(false);
        when(repositorio.existsByRecorridoIdAndOrden(20L, 3)).thenReturn(true);

        assertThatThrownBy(() -> servicio.agregar(20L, new PuntoEnRecorridoRequest(1L, 3, null)))
                .isInstanceOf(RecursoDuplicadoException.class)
                .hasMessageContaining("posición 3");
    }

    @Test
    void noSePuedeQuitarUnPuntoQuePerteneceAOtroRecorrido() {
        RecorridoPuntoRuta deOtroRecorrido = new RecorridoPuntoRuta(recorrido(21L), punto(1L, 41.64, -4.72), 0, null);
        when(repositorio.findById(5L)).thenReturn(Optional.of(deOtroRecorrido));

        assertThatThrownBy(() -> servicio.quitar(20L, 5L)).isInstanceOf(RecursoNoEncontradoException.class);
        verify(repositorio, never()).delete(any());
    }

    @Test
    void marcarComoPuntoDeInteresReutilizaLaUbicacionDelPunto() {
        RecorridoPuntoRuta relacion = new RecorridoPuntoRuta(recorrido(20L), punto(7L, 41.64, -4.72), 0, null);
        PuntoDeInteres iglesia = new PuntoDeInteres(TipoPuntoInteres.IGLESIA, "San Benito", null, null, null);
        when(repositorio.findById(5L)).thenReturn(Optional.of(relacion));
        when(puntoDeInteresService.crear(any())).thenReturn(iglesia);
        when(repositorio.save(relacion)).thenReturn(relacion);

        servicio.marcarComoPuntoDeInteres(20L, 5L,
                new MarcarPuntoDeInteresRequest(TipoPuntoInteres.IGLESIA, "San Benito", null, null));

        ArgumentCaptor<PuntoDeInteresRequest> peticion = ArgumentCaptor.forClass(PuntoDeInteresRequest.class);
        verify(puntoDeInteresService).crear(peticion.capture());
        assertThat(peticion.getValue().ubicacionId()).isEqualTo(7L);
        assertThat(relacion.getPuntoRuta()).isSameAs(iglesia);
    }

    @Test
    void elPuntoSustituidoPorElPuntoDeInteresSeBorraSiNadieLoUsa() {
        PuntoRuta original = punto(7L, 41.64, -4.72);
        RecorridoPuntoRuta relacion = new RecorridoPuntoRuta(recorrido(20L), original, 0, null);
        when(repositorio.findById(5L)).thenReturn(Optional.of(relacion));
        when(puntoDeInteresService.crear(any()))
                .thenReturn(new PuntoDeInteres(TipoPuntoInteres.IGLESIA, "San Benito", null, null, null));
        when(repositorio.save(relacion)).thenReturn(relacion);
        when(repositorio.existsByPuntoRutaId(7L)).thenReturn(false);

        servicio.marcarComoPuntoDeInteres(20L, 5L,
                new MarcarPuntoDeInteresRequest(TipoPuntoInteres.IGLESIA, "San Benito", null, null));

        verify(puntoRutaRepository).delete(original);
    }

    @Test
    void laJuntaDeOtraCiudadNoPuedeTocarLosPuntosDeUnRecorridoAjeno() {
        doThrow(new AccesoDenegadoException("otra ciudad"))
                .when(autorizacionRecorridoService).exigirPuedeEditarRecorrido(20L);

        assertThatThrownBy(() -> servicio.quitar(20L, 5L)).isInstanceOf(AccesoDenegadoException.class);
        verify(repositorio, never()).delete(any());
    }
}
