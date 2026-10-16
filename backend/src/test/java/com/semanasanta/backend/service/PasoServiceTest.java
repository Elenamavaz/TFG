package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PasoRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Paso;
import com.semanasanta.backend.repository.PasoRepository;
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
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasoServiceTest {

    @Mock
    private PasoRepository pasoRepository;
    @Mock
    private CofradiaService cofradiaService;
    @Mock
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    @InjectMocks
    private PasoService pasoService;

    @Test
    void laJuntaCreaUnPasoParaUnaCofradiaDeSuCiudad() {
        Cofradia cofradia = cofradia(3L, ciudad(1L));
        when(cofradiaService.obtener(3L)).thenReturn(cofradia);
        when(pasoRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Paso paso = pasoService.crear(new PasoRequest("Cristo Yacente", null, null, null, 3L));

        verify(miembroJuntaCofradiaService).exigirJuntaDeLaCiudad(1L);
        assertThat(paso.getCofradia()).isSameAs(cofradia);
    }

    @Test
    void unPasoPuedeCambiarDeCofradiaDentroDeLaMismaCiudad() {
        Ciudad ciudad = ciudad(1L);
        Paso paso = conId(new Paso("Cristo Yacente", null, null, null, cofradia(3L, ciudad)), 9L);
        Cofradia otraDeLaMismaCiudad = cofradia(4L, ciudad);
        when(pasoRepository.findById(9L)).thenReturn(Optional.of(paso));
        when(cofradiaService.obtener(4L)).thenReturn(otraDeLaMismaCiudad);
        when(pasoRepository.save(paso)).thenReturn(paso);

        pasoService.actualizar(9L, new PasoRequest("Cristo Yacente", null, null, null, 4L));

        assertThat(paso.getCofradia()).isSameAs(otraDeLaMismaCiudad);
    }

    @Test
    void unPasoNoPuedeReasignarseAUnaCofradiaDeOtraCiudad() {
        Paso paso = conId(new Paso("Cristo Yacente", null, null, null, cofradia(3L, ciudad(1L))), 9L);
        when(pasoRepository.findById(9L)).thenReturn(Optional.of(paso));
        when(cofradiaService.obtener(4L)).thenReturn(cofradia(4L, ciudad(2L)));

        assertThatThrownBy(() -> pasoService.actualizar(9L, new PasoRequest("X", null, null, null, 4L)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(pasoRepository, never()).save(any());
    }
}
