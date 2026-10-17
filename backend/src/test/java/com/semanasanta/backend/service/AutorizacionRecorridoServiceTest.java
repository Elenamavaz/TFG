package com.semanasanta.backend.service;

import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.EventoRepository;
import com.semanasanta.backend.repository.ProcesionRepository;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// Bug 25: un recurso de recorrido solo lo modifica la Junta de la ciudad de
// la procesión/evento que lo usa; si aún no lo usa nadie, cualquier Junta.
@ExtendWith(MockitoExtension.class)
class AutorizacionRecorridoServiceTest {

    @Mock
    private ProcesionRepository procesionRepository;
    @Mock
    private EventoRepository eventoRepository;
    @Mock
    private RecorridoPuntoRutaRepository recorridoPuntoRutaRepository;
    @Mock
    private PuntoRutaRepository puntoRutaRepository;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    @InjectMocks
    private AutorizacionRecorridoService autorizacion;

    private Procesion procesionDeLaCiudad(Long ciudadId, Recorrido recorrido) {
        return procesion(10L, cofradia(3L, ciudad(ciudadId)), recorrido);
    }

    @Test
    void elRecorridoDeUnaProcesionLoEditaLaJuntaDeSuCiudad() {
        Recorrido recorrido = recorrido(20L);
        when(procesionRepository.findByRecorridoId(20L)).thenReturn(Optional.of(procesionDeLaCiudad(1L, recorrido)));

        autorizacion.exigirPuedeEditarRecorrido(20L);

        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeEditarElRecorrido() {
        Recorrido recorrido = recorrido(20L);
        when(procesionRepository.findByRecorridoId(20L)).thenReturn(Optional.of(procesionDeLaCiudad(1L, recorrido)));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> autorizacion.exigirPuedeEditarRecorrido(20L))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void unRecorridoSinProcesionTodaviaLoEditaCualquierJunta() {
        // P.ej. un GPX recién importado, antes de guardar la procesión.
        when(procesionRepository.findByRecorridoId(20L)).thenReturn(Optional.empty());

        autorizacion.exigirPuedeEditarRecorrido(20L);

        verify(miembroJuntaCofradiaService).exigirJunta();
        verify(miembroJuntaCofradiaService, never()).exigirJuntaDeLaCiudad(anyLong());
    }

    @Test
    void unPuntoDelRecorridoDeOtraCiudadNoSePuedeEditar() {
        Recorrido recorrido = recorrido(20L);
        PuntoRuta punto = conId(new PuntoRuta(new Ubicacion(41.65, -4.72, null)), 7L);
        when(recorridoPuntoRutaRepository.findByPuntoRutaId(7L))
                .thenReturn(List.of(new RecorridoPuntoRuta(recorrido, punto, 0, null)));
        when(procesionRepository.findByRecorridoId(20L)).thenReturn(Optional.of(procesionDeLaCiudad(2L, recorrido)));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(2L);

        assertThatThrownBy(() -> autorizacion.exigirPuedeEditarPuntoRuta(7L))
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void laUbicacionDeUnEventoLaEditaLaJuntaDeSuCiudad() {
        Evento evento = new Evento("Pregón", null, null, LocalDateTime.now(), null, null);
        evento.addCofradia(cofradia(3L, ciudad(1L)));
        when(eventoRepository.findByUbicacionId(5L)).thenReturn(List.of(evento));
        when(puntoRutaRepository.findByUbicacionId(5L)).thenReturn(List.of());

        autorizacion.exigirPuedeEditarUbicacion(5L);

        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
    }

    @Test
    void sinSerJuntaNoSePuedeEditarNada() {
        doThrow(new AccesoDenegadoException("solo junta")).when(miembroJuntaCofradiaService).exigirJunta();

        assertThatThrownBy(() -> autorizacion.exigirPuedeEditarUbicacion(5L))
                .isInstanceOf(AccesoDenegadoException.class);
    }
}
