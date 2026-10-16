package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AuthResponse;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.model.CodigoAcceso;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.EstadoCodigo;
import com.semanasanta.backend.model.MiembroJuntaCofradia;
import com.semanasanta.backend.repository.CodigoAccesoRepository;
import com.semanasanta.backend.repository.UsuarioRepository;
import com.semanasanta.backend.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CodigoAccesoRepository codigoAccesoRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @AfterEach
    void limpiar() {
        cerrarSesion();
    }

    // --- login con email y contraseña ---

    @Test
    void loginDeAdministradorDevuelveTokenConRolAdmin() {
        Administrador admin = administrador(1L);
        when(usuarioRepository.findByEmail("admin1@test.es")).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("Clave.123", "hash")).thenReturn(true);
        when(jwtService.generarToken(1L, "ADMIN")).thenReturn("token-admin");

        AuthResponse respuesta = authService.login("admin1@test.es", "Clave.123");

        assertThat(respuesta).isEqualTo(new AuthResponse("token-admin", "ADMIN", 1L, true));
    }

    @Test
    void loginDeMiembroDeJuntaDevuelveRolJunta() {
        MiembroJuntaCofradia miembro = miembro(2L, junta(1L, ciudad(1L)));
        when(usuarioRepository.findByEmail(miembro.getEmail())).thenReturn(Optional.of(miembro));
        when(passwordEncoder.matches("Clave.123", "hash")).thenReturn(true);
        when(jwtService.generarToken(2L, "JUNTA")).thenReturn("token-junta");

        AuthResponse respuesta = authService.login(miembro.getEmail(), "Clave.123");

        assertThat(respuesta.rol()).isEqualTo("JUNTA");
        assertThat(respuesta.activo()).isTrue();
    }

    @Test
    void unMiembroDesactivadoPuedeIniciarSesionPeroSeIndicaQueNoEstaActivo() {
        MiembroJuntaCofradia miembro = miembro(2L, junta(1L, ciudad(1L)));
        miembro.setActivo(false);
        when(usuarioRepository.findByEmail(miembro.getEmail())).thenReturn(Optional.of(miembro));
        when(passwordEncoder.matches("Clave.123", "hash")).thenReturn(true);
        when(jwtService.generarToken(2L, "JUNTA")).thenReturn("token");

        AuthResponse respuesta = authService.login(miembro.getEmail(), "Clave.123");

        assertThat(respuesta.activo()).isFalse();
    }

    @Test
    void loginConEmailInexistenteFalla() {
        when(usuarioRepository.findByEmail("nadie@test.es")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login("nadie@test.es", "x"))
                .isInstanceOf(CredencialesInvalidasException.class)
                .hasMessage("Email o contraseña incorrectos");
    }

    @Test
    void loginConContrasenaIncorrectaFallaConElMismoMensaje() {
        // Mismo mensaje que con email inexistente: no revela qué emails existen.
        when(usuarioRepository.findByEmail("admin1@test.es")).thenReturn(Optional.of(administrador(1L)));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.login("admin1@test.es", "mala"))
                .isInstanceOf(CredencialesInvalidasException.class)
                .hasMessage("Email o contraseña incorrectos");
        verify(jwtService, never()).generarToken(any(), any());
    }

    // --- login con código de acceso (cofrade) ---

    @Test
    void codigoEmitidoSeMarcaComoValidadoYDaRolCofradeConLaCofradia() {
        Cofradia cofradia = cofradia(5L, ciudad(1L));
        CodigoAcceso codigo = new CodigoAcceso("ABCD1234", cofradia);
        when(codigoAccesoRepository.findByCodigo("ABCD1234")).thenReturn(Optional.of(codigo));
        when(jwtService.generarToken(5L, "COFRADE")).thenReturn("token-cofrade");

        AuthResponse respuesta = authService.loginConCodigoAcceso("ABCD1234");

        assertThat(respuesta).isEqualTo(new AuthResponse("token-cofrade", "COFRADE", 5L, true));
        assertThat(codigo.getEstado()).isEqualTo(EstadoCodigo.VALIDADO);
        verify(codigoAccesoRepository).save(codigo);
    }

    @Test
    void codigoYaValidadoSigueSirviendoSinVolverAGuardarse() {
        CodigoAcceso codigo = new CodigoAcceso("ABCD1234", cofradia(5L, ciudad(1L)));
        codigo.setEstado(EstadoCodigo.VALIDADO);
        when(codigoAccesoRepository.findByCodigo("ABCD1234")).thenReturn(Optional.of(codigo));
        when(jwtService.generarToken(5L, "COFRADE")).thenReturn("token");

        authService.loginConCodigoAcceso("ABCD1234");

        verify(codigoAccesoRepository, never()).save(any());
    }

    @Test
    void codigoRevocadoNoPermiteEntrar() {
        CodigoAcceso codigo = new CodigoAcceso("ABCD1234", cofradia(5L, ciudad(1L)));
        codigo.setEstado(EstadoCodigo.REVOCADO);
        when(codigoAccesoRepository.findByCodigo("ABCD1234")).thenReturn(Optional.of(codigo));

        assertThatThrownBy(() -> authService.loginConCodigoAcceso("ABCD1234"))
                .isInstanceOf(CredencialesInvalidasException.class)
                .hasMessageContaining("revocado");
    }

    @Test
    void codigoInexistenteNoPermiteEntrar() {
        when(codigoAccesoRepository.findByCodigo("NOEXISTE")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.loginConCodigoAcceso("NOEXISTE"))
                .isInstanceOf(CredencialesInvalidasException.class);
    }

    // --- cambiar contraseña ---

    @Test
    void cambiarContrasenaGuardaElNuevoHashYTerminaElAltaProvisional() {
        MiembroJuntaCofradia miembro = miembro(2L, junta(1L, ciudad(1L)));
        autenticarComo(2L, "JUNTA");
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(miembro));
        when(passwordEncoder.matches("Actual.1", "hash")).thenReturn(true);
        when(passwordEncoder.encode("Nueva.123")).thenReturn("hash-nuevo");

        authService.cambiarPassword("Actual.1", "Nueva.123");

        assertThat(miembro.getPasswordHash()).isEqualTo("hash-nuevo");
        assertThat(miembro.isPasswordProvisional()).isFalse();
        verify(usuarioRepository).save(miembro);
    }

    @Test
    void cambiarContrasenaConLaActualIncorrectaFalla() {
        autenticarComo(1L, "ADMIN");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(administrador(1L)));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> authService.cambiarPassword("mala", "Nueva.123"))
                .isInstanceOf(CredencialesInvalidasException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void unMiembroDesactivadoNoPuedeCambiarSuContrasena() {
        MiembroJuntaCofradia miembro = miembro(2L, junta(1L, ciudad(1L)));
        miembro.setActivo(false);
        autenticarComo(2L, "JUNTA");
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(miembro));
        when(passwordEncoder.matches("Actual.1", "hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.cambiarPassword("Actual.1", "Nueva.123"))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void cambiarContrasenaSinSesionFalla() {
        assertThatThrownBy(() -> authService.cambiarPassword("a", "b"))
                .isInstanceOf(IllegalStateException.class);
    }
}
