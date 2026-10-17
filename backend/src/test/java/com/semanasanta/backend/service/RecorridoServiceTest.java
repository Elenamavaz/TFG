package com.semanasanta.backend.service;

import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.ArchivoInvalidoException;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.EventoRepository;
import com.semanasanta.backend.repository.ProcesionRepository;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoRepository;
import com.semanasanta.backend.repository.UbicacionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.conId;
import static com.semanasanta.backend.support.DatosPrueba.recorrido;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RecorridoServiceTest {

    @Mock
    private RecorridoRepository recorridoRepository;
    @Mock
    private UbicacionRepository ubicacionRepository;
    @Mock
    private PuntoRutaRepository puntoRutaRepository;
    @Mock
    private RecorridoPuntoRutaRepository recorridoPuntoRutaRepository;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    @Mock
    private AutorizacionRecorridoService autorizacionRecorridoService;
    @Mock
    private ProcesionRepository procesionRepository;
    @Mock
    private EventoRepository eventoRepository;

    @InjectMocks
    private RecorridoService recorridoService;

    // Tres puntos en línea recta hacia el norte separados 0.01º (~1.11 km cada tramo).
    private static final String GPX = """
            <?xml version="1.0" encoding="UTF-8"?>
            <gpx version="1.1" creator="test">
              <trk><trkseg>
                <trkpt lat="41.64" lon="-4.72"/>
                <trkpt lat="41.65" lon="-4.72"/>
                <trkpt lat="41.66" lon="-4.72"/>
              </trkseg></trk>
            </gpx>
            """;

    private static MockMultipartFile archivo(String contenido) {
        return new MockMultipartFile("archivo", "ruta.gpx", "application/gpx+xml",
                contenido.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void importarGpxCreaElRecorridoConSusPuntosEnOrdenYLaDistancia() {
        when(recorridoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(ubicacionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(puntoRutaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Recorrido recorrido = recorridoService.importarGpx(archivo(GPX));

        assertThat(recorrido.getDistanciaTotal()).isCloseTo(2.22, within(0.01));
        ArgumentCaptor<RecorridoPuntoRuta> relaciones = ArgumentCaptor.forClass(RecorridoPuntoRuta.class);
        verify(recorridoPuntoRutaRepository, times(3)).save(relaciones.capture());
        List<Integer> ordenes = relaciones.getAllValues().stream().map(RecorridoPuntoRuta::getOrden).toList();
        assertThat(ordenes).containsExactly(0, 1, 2);
        assertThat(relaciones.getAllValues().get(0).getPuntoRuta().getUbicacion().getLatitud()).isEqualTo(41.64);
    }

    @Test
    void importarSinArchivoFalla() {
        assertThatThrownBy(() -> recorridoService.importarGpx(archivo("")))
                .isInstanceOf(ArchivoInvalidoException.class)
                .hasMessageContaining("No se ha recibido");
        verify(recorridoRepository, never()).save(any());
    }

    @Test
    void importarUnArchivoQueNoEsGpxFallaSinGuardarNada() {
        assertThatThrownBy(() -> recorridoService.importarGpx(archivo("hola")))
                .isInstanceOf(ArchivoInvalidoException.class);
        verify(recorridoRepository, never()).save(any());
    }

    @Test
    void soloUnaJuntaPuedeImportarRecorridos() {
        doThrow(new AccesoDenegadoException("solo junta")).when(miembroJuntaCofradiaService).exigirJunta();

        assertThatThrownBy(() -> recorridoService.importarGpx(archivo(GPX)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(recorridoRepository, never()).save(any());
    }

    // --- eliminar y recorridos huérfanos (bug 26) ---

    private static PuntoRuta punto(Long id, Long ubicacionId) {
        return conId(new PuntoRuta(conId(new Ubicacion(41.65, -4.72, null), ubicacionId)), id);
    }

    @Test
    void unRecorridoAsignadoAUnaProcesionNoSeEliminaSuelto() {
        when(recorridoRepository.findById(20L)).thenReturn(Optional.of(recorrido(20L)));
        when(procesionRepository.existsByRecorridoId(20L)).thenReturn(true);

        assertThatThrownBy(() -> recorridoService.eliminar(20L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("asignado a una procesión");
        verify(recorridoRepository, never()).delete(any());
    }

    @Test
    void eliminarUnRecorridoBorraSusPuntosYLasUbicacionesQueSoloUsabaEl() {
        Recorrido recorrido = recorrido(20L);
        PuntoRuta propio = punto(1L, 11L);
        PuntoRuta compartido = punto(2L, 12L);
        List<RecorridoPuntoRuta> relaciones = List.of(
                new RecorridoPuntoRuta(recorrido, propio, 0, null),
                new RecorridoPuntoRuta(recorrido, compartido, 1, null));
        when(recorridoRepository.findById(20L)).thenReturn(Optional.of(recorrido));
        when(recorridoPuntoRutaRepository.findByRecorridoIdOrderByOrdenAsc(20L)).thenReturn(relaciones);
        when(recorridoPuntoRutaRepository.existsByPuntoRutaId(1L)).thenReturn(false); // solo en este
        when(recorridoPuntoRutaRepository.existsByPuntoRutaId(2L)).thenReturn(true); // también en otro recorrido

        recorridoService.eliminar(20L);

        verify(autorizacionRecorridoService).exigirPuedeEditarRecorrido(20L);
        verify(recorridoPuntoRutaRepository).deleteAll(relaciones);
        verify(puntoRutaRepository).delete(propio);
        verify(puntoRutaRepository, never()).delete(compartido);
        verify(ubicacionRepository).delete(propio.getUbicacion());
        verify(recorridoRepository).delete(recorrido);
    }

    @Test
    void unaUbicacionQueUsaUnEventoNoSeBorraConElRecorrido() {
        Recorrido recorrido = recorrido(20L);
        PuntoRuta propio = punto(1L, 11L);
        when(recorridoRepository.findById(20L)).thenReturn(Optional.of(recorrido));
        when(recorridoPuntoRutaRepository.findByRecorridoIdOrderByOrdenAsc(20L))
                .thenReturn(List.of(new RecorridoPuntoRuta(recorrido, propio, 0, null)));
        when(eventoRepository.existsByUbicacionId(11L)).thenReturn(true);

        recorridoService.eliminar(20L);

        verify(puntoRutaRepository).delete(propio);
        verify(ubicacionRepository, never()).delete(any());
    }

    @Test
    void eliminarSiHuerfanoNoTocaUnRecorridoQueSigueAsignado() {
        when(procesionRepository.existsByRecorridoId(20L)).thenReturn(true);

        recorridoService.eliminarSiHuerfano(20L);

        verify(recorridoRepository, never()).delete(any());
    }

    @Test
    void soloLaJuntaDeSuProcesionPuedeEliminarUnRecorrido() {
        doThrow(new AccesoDenegadoException("otra ciudad"))
                .when(autorizacionRecorridoService).exigirPuedeEditarRecorrido(20L);

        assertThatThrownBy(() -> recorridoService.eliminar(20L)).isInstanceOf(AccesoDenegadoException.class);
        verify(recorridoRepository, never()).delete(any());
    }
}
