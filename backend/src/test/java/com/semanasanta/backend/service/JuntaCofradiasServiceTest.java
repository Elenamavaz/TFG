package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.JuntaCofradiasRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.repository.JuntaCofradiasRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class JuntaCofradiasServiceTest {

    @Mock
    private JuntaCofradiasRepository juntaCofradiasRepository;
    @Mock
    private CiudadService ciudadService;
    @Mock
    private AdministradorService administradorService;

    @InjectMocks
    private JuntaCofradiasService juntaCofradiasService;

    @Test
    void elAdministradorCreaLaJuntaDeUnaCiudad() {
        Ciudad ciudad = ciudad(1L);
        when(ciudadService.obtener(1L)).thenReturn(ciudad);
        when(juntaCofradiasRepository.existsByCiudadId(1L)).thenReturn(false);
        when(juntaCofradiasRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        JuntaCofradias creada = juntaCofradiasService.crear(
                new JuntaCofradiasRequest("Junta de Valladolid", "junta@test.es", null, 1L, true));

        verify(administradorService).exigirAdministrador();
        assertThat(creada.getCiudad()).isSameAs(ciudad);
    }

    @Test
    void unaCiudadSoloPuedeTenerUnaJunta() {
        when(ciudadService.obtener(1L)).thenReturn(ciudad(1L));
        when(juntaCofradiasRepository.existsByCiudadId(1L)).thenReturn(true);

        assertThatThrownBy(() -> juntaCofradiasService.crear(
                new JuntaCofradiasRequest("Otra", null, null, 1L, true)))
                .isInstanceOf(RecursoDuplicadoException.class);
        verify(juntaCofradiasRepository, never()).save(any());
    }

    @Test
    void moverLaJuntaAUnaCiudadQueYaTieneJuntaSeRechaza() {
        when(juntaCofradiasRepository.findById(5L)).thenReturn(Optional.of(junta(5L, ciudad(1L))));
        when(ciudadService.obtener(2L)).thenReturn(ciudad(2L));
        when(juntaCofradiasRepository.existsByCiudadId(2L)).thenReturn(true);

        assertThatThrownBy(() -> juntaCofradiasService.actualizar(5L,
                new JuntaCofradiasRequest("Junta", null, null, 2L, true)))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    @Test
    void actualizarSinCambiarDeCiudadNoCompruebaDuplicados() {
        JuntaCofradias junta = junta(5L, ciudad(1L));
        when(juntaCofradiasRepository.findById(5L)).thenReturn(Optional.of(junta));
        when(juntaCofradiasRepository.save(junta)).thenReturn(junta);

        juntaCofradiasService.actualizar(5L, new JuntaCofradiasRequest("Nuevo nombre", null, null, 1L, false));

        verify(juntaCofradiasRepository, never()).existsByCiudadId(any());
        assertThat(junta.getNombre()).isEqualTo("Nuevo nombre");
        assertThat(junta.isActiva()).isFalse();
    }

    @Test
    void soloElAdministradorGestionaJuntas() {
        doThrow(new AccesoDenegadoException("solo admin")).when(administradorService).exigirAdministrador();

        assertThatThrownBy(() -> juntaCofradiasService.eliminar(5L)).isInstanceOf(AccesoDenegadoException.class);
        verify(juntaCofradiasRepository, never()).delete(any());
    }
}
