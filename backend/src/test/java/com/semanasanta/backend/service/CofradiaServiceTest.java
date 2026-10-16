package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CofradiaRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.repository.CofradiaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CofradiaServiceTest {

    @Mock
    private CofradiaRepository cofradiaRepository;
    @Mock
    private CiudadService ciudadService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    @InjectMocks
    private CofradiaService cofradiaService;

    // --- listados públicos ---

    @Test
    void elCiudadanoSoloVeLasCofradiasActivas() {
        Ciudad ciudad = ciudad(1L);
        Cofradia activa = cofradia(3L, ciudad);
        Cofradia inactiva = cofradia(4L, ciudad);
        inactiva.setActiva(false);
        when(cofradiaRepository.findAll()).thenReturn(List.of(activa, inactiva));

        assertThat(cofradiaService.listar()).containsExactly(activa);
        assertThat(cofradiaService.listar(true)).containsExactly(activa, inactiva);
    }

    @Test
    void listarDeUnaCiudadInexistenteDevuelve404() {
        when(ciudadService.obtener(99L)).thenThrow(new RecursoNoEncontradoException("no existe"));

        assertThatThrownBy(() -> cofradiaService.listarDeCiudad(99L)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    // --- crear / actualizar / eliminar ---

    @Test
    void laJuntaDeLaCiudadCreaUnaCofradiaActiva() {
        when(ciudadService.obtener(1L)).thenReturn(ciudad(1L));
        when(cofradiaRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Cofradia creada = cofradiaService.crear(new CofradiaRequest("Vera Cruz", null, null, null, 1L, true));

        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
        assertThat(creada.getNombre()).isEqualTo("Vera Cruz");
        assertThat(creada.isActiva()).isTrue();
        assertThat(creada.getFechaCreacion()).isNotNull();
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeCrearCofradias() {
        when(ciudadService.obtener(1L)).thenReturn(ciudad(1L));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> cofradiaService.crear(new CofradiaRequest("X", null, null, null, 1L, true)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(cofradiaRepository, never()).save(any());
    }

    @Test
    void unaCofradiaNoPuedeMoverseAOtraCiudad() {
        when(cofradiaRepository.findById(3L)).thenReturn(Optional.of(cofradia(3L, ciudad(1L))));

        assertThatThrownBy(() -> cofradiaService.actualizar(3L, new CofradiaRequest("X", null, null, null, 2L, true)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(cofradiaRepository, never()).save(any());
    }

    @Test
    void actualizarPermiteDesactivarLaCofradia() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        when(cofradiaRepository.findById(3L)).thenReturn(Optional.of(cofradia));
        when(cofradiaRepository.save(cofradia)).thenReturn(cofradia);

        cofradiaService.actualizar(3L, new CofradiaRequest("Nuevo nombre", "Historia", null, null, 1L, false));

        assertThat(cofradia.getNombre()).isEqualTo("Nuevo nombre");
        assertThat(cofradia.isActiva()).isFalse();
    }

    @Test
    void eliminarUnaCofradiaAjenaSeRechaza() {
        when(cofradiaRepository.findById(3L)).thenReturn(Optional.of(cofradia(3L, ciudad(1L))));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(anyLong());

        assertThatThrownBy(() -> cofradiaService.eliminar(3L)).isInstanceOf(AccesoDenegadoException.class);
        verify(cofradiaRepository, never()).delete(any());
    }

    // --- resolución de cofradías de un evento/procesión ---

    @Test
    void resolverCofradiasDeLaMismaCiudadLasDevuelveYAutoriza() {
        Ciudad ciudad = ciudad(1L);
        Cofradia a = cofradia(3L, ciudad);
        Cofradia b = cofradia(4L, ciudad);
        when(cofradiaRepository.findById(3L)).thenReturn(Optional.of(a));
        when(cofradiaRepository.findById(4L)).thenReturn(Optional.of(b));

        Set<Cofradia> resultado = cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L, 4L));

        assertThat(resultado).containsExactly(a, b);
        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
    }

    @Test
    void unEventoNoPuedeMezclarCofradiasDeCiudadesDistintas() {
        when(cofradiaRepository.findById(3L)).thenReturn(Optional.of(cofradia(3L, ciudad(1L))));
        when(cofradiaRepository.findById(4L)).thenReturn(Optional.of(cofradia(4L, ciudad(2L))));

        assertThatThrownBy(() -> cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(3L, 4L)))
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("misma ciudad");
    }

    @Test
    void resolverConUnaCofradiaInexistenteDevuelve404() {
        when(cofradiaRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List.of(99L)))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }
}
