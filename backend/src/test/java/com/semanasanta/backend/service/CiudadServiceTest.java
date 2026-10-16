package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CiudadRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CiudadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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
class CiudadServiceTest {

    @Mock
    private CiudadRepository ciudadRepository;
    @Mock
    private AdministradorService administradorService;

    @InjectMocks
    private CiudadService ciudadService;

    private static CiudadRequest request(boolean activa) {
        return new CiudadRequest("Valladolid", "Castilla y León", "Valladolid", null, null, activa, 41.65, -4.72);
    }

    @Test
    void elCiudadanoSoloVeLasCiudadesActivas() {
        Ciudad activa = ciudad(1L);
        Ciudad inactiva = ciudad(2L);
        inactiva.setActiva(false);
        when(ciudadRepository.findAll()).thenReturn(List.of(activa, inactiva));

        assertThat(ciudadService.listar()).containsExactly(activa);
        assertThat(ciudadService.listar(true)).containsExactly(activa, inactiva);
    }

    @Test
    void elAdministradorCreaUnaCiudad() {
        when(ciudadRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Ciudad creada = ciudadService.crear(request(true));

        verify(administradorService).exigirAdministrador();
        assertThat(creada.getNombre()).isEqualTo("Valladolid");
        assertThat(creada.isActiva()).isTrue();
    }

    @Test
    void soloElAdministradorPuedeCrearCiudades() {
        doThrow(new AccesoDenegadoException("solo admin")).when(administradorService).exigirAdministrador();

        assertThatThrownBy(() -> ciudadService.crear(request(true))).isInstanceOf(AccesoDenegadoException.class);
        verify(ciudadRepository, never()).save(any());
    }

    @Test
    void actualizarPermiteDesactivarUnaCiudad() {
        Ciudad ciudad = ciudad(1L);
        when(ciudadRepository.findById(1L)).thenReturn(Optional.of(ciudad));
        when(ciudadRepository.save(ciudad)).thenReturn(ciudad);

        ciudadService.actualizar(1L, request(false));

        assertThat(ciudad.isActiva()).isFalse();
    }

    @Test
    void obtenerUnaCiudadInexistenteDevuelve404() {
        when(ciudadRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ciudadService.obtener(99L))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("99");
    }
}
