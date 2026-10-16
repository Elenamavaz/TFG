package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CiudadInformacionRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CiudadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static com.semanasanta.backend.support.DatosPrueba.ciudad;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

// La Junta solo puede editar historia y patrimonio de SU ciudad (el resto
// de datos de la ciudad son cosa del Administrador, ver CiudadService).
@ExtendWith(MockitoExtension.class)
class InformacionCiudadServiceTest {

    @Mock
    private CiudadRepository ciudadRepository;
    @Mock
    private CiudadService ciudadService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    @InjectMocks
    private InformacionCiudadService servicio;

    @Test
    void laJuntaActualizaSoloHistoriaYPatrimonio() {
        Ciudad ciudad = ciudad(1L);
        when(ciudadService.obtener(1L)).thenReturn(ciudad);
        when(ciudadRepository.save(ciudad)).thenReturn(ciudad);

        servicio.actualizarInformacion(1L, new CiudadInformacionRequest("Nueva historia", "Nuevo patrimonio"));

        assertThat(ciudad.getHistoria()).isEqualTo("Nueva historia");
        assertThat(ciudad.getPatrimonio()).isEqualTo("Nuevo patrimonio");
        assertThat(ciudad.getNombre()).isEqualTo("Ciudad 1");
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeEditarla() {
        when(ciudadService.obtener(1L)).thenReturn(ciudad(1L));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> servicio.actualizarInformacion(1L, new CiudadInformacionRequest("x", "y")))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(ciudadRepository, never()).save(any());
    }
}
