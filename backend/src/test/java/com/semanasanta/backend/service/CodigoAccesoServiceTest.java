package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CodigoAccesoRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.model.CodigoAcceso;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.EstadoCodigo;
import com.semanasanta.backend.repository.CodigoAccesoRepository;
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
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CodigoAccesoServiceTest {

    @Mock
    private CodigoAccesoRepository codigoAccesoRepository;
    @Mock
    private CofradiaService cofradiaService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    @InjectMocks
    private CodigoAccesoService codigoAccesoService;

    @Test
    void emitirGeneraUnCodigoDeOchoCaracteresEnMayusculas() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        when(cofradiaService.obtener(3L)).thenReturn(cofradia);
        when(codigoAccesoRepository.findByCodigo(anyString())).thenReturn(Optional.empty());
        when(codigoAccesoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CodigoAcceso emitido = codigoAccesoService.emitir(new CodigoAccesoRequest(3L));

        assertThat(emitido.getCodigo()).hasSize(8).isUpperCase();
        assertThat(emitido.getEstado()).isEqualTo(EstadoCodigo.EMITIDO);
        assertThat(emitido.getCofradia()).isSameAs(cofradia);
        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
    }

    @Test
    void siElCodigoGeneradoYaExisteSeGeneraOtro() {
        when(cofradiaService.obtener(3L)).thenReturn(cofradia(3L, ciudad(1L)));
        CodigoAcceso existente = new CodigoAcceso("REPETIDO", cofradia(3L, ciudad(1L)));
        when(codigoAccesoRepository.findByCodigo(anyString()))
                .thenReturn(Optional.of(existente))
                .thenReturn(Optional.empty());
        when(codigoAccesoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        codigoAccesoService.emitir(new CodigoAccesoRequest(3L));

        verify(codigoAccesoRepository, times(2)).findByCodigo(anyString());
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeEmitirCodigos() {
        when(cofradiaService.obtener(3L)).thenReturn(cofradia(3L, ciudad(1L)));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> codigoAccesoService.emitir(new CodigoAccesoRequest(3L)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(codigoAccesoRepository, never()).save(any());
    }

    @Test
    void revocarMarcaElCodigoComoRevocado() {
        CodigoAcceso codigo = conId(new CodigoAcceso("ABCD1234", cofradia(3L, ciudad(1L))), 8L);
        when(codigoAccesoRepository.findById(8L)).thenReturn(Optional.of(codigo));
        when(codigoAccesoRepository.save(codigo)).thenReturn(codigo);

        codigoAccesoService.revocar(8L);

        assertThat(codigo.getEstado()).isEqualTo(EstadoCodigo.REVOCADO);
    }

    @Test
    void unaJuntaDeOtraCiudadNoPuedeVerNiRevocarCodigosAjenos() {
        // Los códigos son credenciales: leerlos también está protegido.
        CodigoAcceso codigo = conId(new CodigoAcceso("ABCD1234", cofradia(3L, ciudad(1L))), 8L);
        when(codigoAccesoRepository.findById(8L)).thenReturn(Optional.of(codigo));
        doThrow(new AccesoDenegadoException("otra ciudad")).when(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);

        assertThatThrownBy(() -> codigoAccesoService.obtener(8L)).isInstanceOf(AccesoDenegadoException.class);
        assertThatThrownBy(() -> codigoAccesoService.revocar(8L)).isInstanceOf(AccesoDenegadoException.class);
        assertThat(codigo.getEstado()).isEqualTo(EstadoCodigo.EMITIDO);
    }
}
