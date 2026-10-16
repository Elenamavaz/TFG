package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.MiembroJuntaCofradiaPerfilRequest;
import com.semanasanta.backend.dto.MiembroJuntaCofradiaRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.model.MiembroJuntaCofradia;
import com.semanasanta.backend.repository.MiembroJuntaCofradiaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MiembroJuntaCofradiaServiceTest {

    @Mock
    private MiembroJuntaCofradiaRepository miembroRepository;
    @Mock
    private JuntaCofradiasService juntaCofradiasService;
    @Mock
    private AdministradorService administradorService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CorreoService correoService;

    @InjectMocks
    private MiembroJuntaCofradiaService miembroService;

    @AfterEach
    void limpiar() {
        cerrarSesion();
    }

    private MiembroJuntaCofradia miembroDeLaCiudad(Long miembroId, Long ciudadId) {
        MiembroJuntaCofradia miembro = miembro(miembroId, junta(ciudadId, ciudad(ciudadId)));
        when(miembroRepository.findById(miembroId)).thenReturn(Optional.of(miembro));
        return miembro;
    }

    // --- exigirJunta / exigirJuntaDeLaCiudad: autorización de la Junta ---

    @Test
    void exigirJuntaPermiteAUnMiembroActivo() {
        autenticarComo(2L, "JUNTA");
        miembroDeLaCiudad(2L, 1L);

        assertThatCode(() -> miembroService.exigirJunta()).doesNotThrowAnyException();
    }

    @Test
    void exigirJuntaRechazaOtrosRoles() {
        autenticarComo(5L, "COFRADE");

        assertThatThrownBy(() -> miembroService.exigirJunta())
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("Junta");
    }

    @Test
    void exigirJuntaRechazaAUnMiembroDesactivado() {
        autenticarComo(2L, "JUNTA");
        miembroDeLaCiudad(2L, 1L).setActivo(false);

        assertThatThrownBy(() -> miembroService.exigirJunta())
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("desactivada");
    }

    @Test
    void exigirJuntaDeLaCiudadPermiteLaJuntaDeEsaCiudad() {
        autenticarComo(2L, "JUNTA");
        miembroDeLaCiudad(2L, 1L);

        assertThatCode(() -> miembroService.exigirJuntaDeLaCiudad(1L)).doesNotThrowAnyException();
    }

    @Test
    void exigirJuntaDeLaCiudadRechazaLaJuntaDeOtraCiudad() {
        autenticarComo(2L, "JUNTA");
        miembroDeLaCiudad(2L, 1L);

        assertThatThrownBy(() -> miembroService.exigirJuntaDeLaCiudad(99L))
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("no gestiona");
    }

    // --- alta de miembros (solo Administrador) ---

    @Test
    void crearMiembroGeneraContrasenaProvisionalYEnviaElCorreo() {
        JuntaCofradias junta = junta(1L, ciudad(1L));
        when(juntaCofradiasService.obtener(1L)).thenReturn(junta);
        when(passwordEncoder.encode(anyString())).thenReturn("hash");
        when(miembroRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MiembroJuntaCofradia creado = miembroService.crear(
                new MiembroJuntaCofradiaRequest("Ana", "ana@test.es", null, 1L, true));

        ArgumentCaptor<String> password = ArgumentCaptor.forClass(String.class);
        verify(correoService).enviarBienvenidaMiembroJunta(eq("Ana"), eq("ana@test.es"), password.capture());
        verify(passwordEncoder).encode(password.getValue()); // se guarda el hash de la misma contraseña enviada
        assertThat(password.getValue()).hasSize(12);
        assertThat(creado.isPasswordProvisional()).isTrue();
        assertThat(creado.getJuntaCofradias()).isSameAs(junta);
    }

    @Test
    void soloUnAdministradorPuedeCrearMiembros() {
        doThrow(new AccesoDenegadoException("solo admin")).when(administradorService).exigirAdministrador();

        assertThatThrownBy(() -> miembroService.crear(
                new MiembroJuntaCofradiaRequest("Ana", "ana@test.es", null, 1L, true)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(miembroRepository, never()).save(any());
        verify(correoService, never()).enviarBienvenidaMiembroJunta(any(), any(), any());
    }

    @Test
    void reenviarInvitacionCambiaLaContrasenaYLaVuelveAEnviar() {
        MiembroJuntaCofradia miembro = miembroDeLaCiudad(2L, 1L);
        miembro.setPasswordProvisional(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hash-nuevo");
        when(miembroRepository.save(miembro)).thenReturn(miembro);

        miembroService.reenviarInvitacion(2L);

        assertThat(miembro.getPasswordHash()).isEqualTo("hash-nuevo");
        assertThat(miembro.isPasswordProvisional()).isTrue();
        verify(correoService).enviarBienvenidaMiembroJunta(eq(miembro.getNombre()), eq(miembro.getEmail()), anyString());
    }

    // --- flujo de reactivación ---

    @Test
    void unMiembroDesactivadoPuedeSolicitarLaReactivacion() {
        autenticarComo(2L, "JUNTA");
        MiembroJuntaCofradia miembro = miembroDeLaCiudad(2L, 1L);
        miembro.setActivo(false);

        miembroService.solicitarReactivacion();

        assertThat(miembro.isSolicitudReactivacionPendiente()).isTrue();
        verify(miembroRepository).save(miembro);
    }

    @Test
    void unMiembroActivoNoPuedeSolicitarReactivacion() {
        autenticarComo(2L, "JUNTA");
        miembroDeLaCiudad(2L, 1L);

        assertThatThrownBy(() -> miembroService.solicitarReactivacion())
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void soloUnMiembroDeJuntaPuedeSolicitarReactivacion() {
        autenticarComo(1L, "ADMIN");

        assertThatThrownBy(() -> miembroService.solicitarReactivacion())
                .isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void aceptarReactivacionActivaAlMiembroYLimpiaLaSolicitud() {
        MiembroJuntaCofradia miembro = miembroDeLaCiudad(2L, 1L);
        miembro.setActivo(false);
        miembro.setSolicitudReactivacionPendiente(true);
        when(miembroRepository.save(miembro)).thenReturn(miembro);

        miembroService.aceptarReactivacion(2L);

        assertThat(miembro.isActivo()).isTrue();
        assertThat(miembro.isSolicitudReactivacionPendiente()).isFalse();
    }

    @Test
    void rechazarReactivacionMantieneAlMiembroDesactivado() {
        MiembroJuntaCofradia miembro = miembroDeLaCiudad(2L, 1L);
        miembro.setActivo(false);
        miembro.setSolicitudReactivacionPendiente(true);
        when(miembroRepository.save(miembro)).thenReturn(miembro);

        miembroService.rechazarReactivacion(2L);

        assertThat(miembro.isActivo()).isFalse();
        assertThat(miembro.isSolicitudReactivacionPendiente()).isFalse();
    }

    @Test
    void reactivarDesdeLaEdicionResuelveLaSolicitudPendiente() {
        MiembroJuntaCofradia miembro = miembroDeLaCiudad(2L, 1L);
        miembro.setActivo(false);
        miembro.setSolicitudReactivacionPendiente(true);
        when(miembroRepository.save(miembro)).thenReturn(miembro);

        miembroService.actualizar(2L, new MiembroJuntaCofradiaRequest("Ana", "ana@test.es", "600", 1L, true));

        assertThat(miembro.isActivo()).isTrue();
        assertThat(miembro.isSolicitudReactivacionPendiente()).isFalse();
    }

    // --- perfil propio ---

    @Test
    void actualizarPerfilPropioConContrasenaNuevaTerminaElAlta() {
        autenticarComo(2L, "JUNTA");
        MiembroJuntaCofradia miembro = miembroDeLaCiudad(2L, 1L);
        when(passwordEncoder.matches("Actual.1", "hash")).thenReturn(true);
        when(passwordEncoder.encode("Nueva.123")).thenReturn("hash-nuevo");
        when(miembroRepository.save(miembro)).thenReturn(miembro);

        miembroService.actualizarPerfilPropio(
                new MiembroJuntaCofradiaPerfilRequest("Ana", "600", "Actual.1", "Nueva.123"));

        assertThat(miembro.getNombre()).isEqualTo("Ana");
        assertThat(miembro.getPasswordHash()).isEqualTo("hash-nuevo");
        assertThat(miembro.isPasswordProvisional()).isFalse();
    }

    @Test
    void actualizarPerfilPropioConContrasenaActualIncorrectaFalla() {
        autenticarComo(2L, "JUNTA");
        miembroDeLaCiudad(2L, 1L);
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> miembroService.actualizarPerfilPropio(
                new MiembroJuntaCofradiaPerfilRequest("Ana", null, "mala", null)))
                .isInstanceOf(CredencialesInvalidasException.class);
        verify(miembroRepository, never()).save(any());
    }
}
