package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.DispositivoPushRequest;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.DispositivoPush;
import com.semanasanta.backend.repository.DispositivoPushRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.ciudad;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DispositivoPushServiceTest {

    @Mock
    private DispositivoPushRepository dispositivoPushRepository;
    @Mock
    private CiudadService ciudadService;

    @InjectMocks
    private DispositivoPushService dispositivoPushService;

    @Test
    void unDispositivoNuevoSeRegistraEnLaCiudadIndicada() {
        Ciudad ciudad = ciudad(1L);
        when(ciudadService.obtener(1L)).thenReturn(ciudad);
        when(dispositivoPushRepository.findByToken("tok")).thenReturn(Optional.empty());
        when(dispositivoPushRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        DispositivoPush registrado = dispositivoPushService.registrar(new DispositivoPushRequest("tok", 1L));

        assertThat(registrado.getToken()).isEqualTo("tok");
        assertThat(registrado.getCiudad()).isSameAs(ciudad);
    }

    @Test
    void siElCiudadanoCambiaDeCiudadSeReutilizaElMismoDispositivo() {
        // No se duplica el registro: el mismo token pasa a recibir avisos de la nueva ciudad.
        DispositivoPush existente = new DispositivoPush("tok", ciudad(1L));
        Ciudad nueva = ciudad(2L);
        when(ciudadService.obtener(2L)).thenReturn(nueva);
        when(dispositivoPushRepository.findByToken("tok")).thenReturn(Optional.of(existente));
        when(dispositivoPushRepository.save(existente)).thenReturn(existente);

        DispositivoPush registrado = dispositivoPushService.registrar(new DispositivoPushRequest("tok", 2L));

        assertThat(registrado).isSameAs(existente);
        assertThat(registrado.getCiudad()).isSameAs(nueva);
    }
}
