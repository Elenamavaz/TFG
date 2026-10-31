package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AdministradorBootstrapRequest;
import com.semanasanta.backend.dto.AdministradorPerfilRequest;
import com.semanasanta.backend.dto.AdministradorRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.repository.AdministradorRepository;
import com.semanasanta.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdministradorServiceTest {

    private static final String SECRETO_BOOTSTRAP = "secreto-de-pruebas";

    @Mock
    private AdministradorRepository administradorRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CorreoService correoService;

    private AdministradorService administradorService;

    @BeforeEach
    void preparar() {
        administradorService = new AdministradorService(administradorRepository, usuarioRepository, passwordEncoder, correoService, SECRETO_BOOTSTRAP);
    }

    @AfterEach
    void limpiar() {
        cerrarSesion();
    }

    // --- exigirAdministrador: base de todos los permisos de Administrador ---

    @Test
    void exigirAdministradorPermiteAlRolAdmin() {
        autenticarComo(1L, "ADMIN");

        assertThatCode(() -> administradorService.exigirAdministrador()).doesNotThrowAnyException();
    }

    @Test
    void exigirAdministradorRechazaAUnAdministradorConLaContrasenaProvisional() {
        Administrador nuevo = administrador(1L);
        nuevo.setPasswordProvisional(true);
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(nuevo));

        assertThatThrownBy(() -> administradorService.exigirAdministrador())
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("contraseña provisional");
    }

    @ParameterizedTest
    @ValueSource(strings = {"JUNTA", "COFRADE"})
    void exigirAdministradorRechazaCualquierOtroRol(String rol) {
        autenticarComo(1L, rol);

        assertThatThrownBy(() -> administradorService.exigirAdministrador())
                .isInstanceOf(AccesoDenegadoException.class);
    }

    // --- crear ---

    @Test
    void alCrearUnAdministradorSeGeneraUnaContrasenaProvisionalYSeEnviaPorCorreo() {
        autenticarComo(1L, "ADMIN");
        when(passwordEncoder.encode(anyString())).thenReturn("hash-bcrypt");
        when(administradorRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Administrador creado = administradorService.crear(new AdministradorRequest("Ana", "nuevo@test.es", "600000000"));

        assertThat(creado.getEmail()).isEqualTo("nuevo@test.es");
        assertThat(creado.getNombre()).isEqualTo("Ana");
        assertThat(creado.getPasswordHash()).isEqualTo("hash-bcrypt");
        assertThat(creado.isPasswordProvisional()).isTrue();
        verify(correoService).enviarBienvenidaAdministrador(eq("Ana"), eq("nuevo@test.es"), anyString());
    }

    @Test
    void reenviarLaInvitacionGeneraOtraContrasenaProvisional() {
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(administrador(1L)));
        Administrador otro = administrador(2L);
        when(administradorRepository.findById(2L)).thenReturn(Optional.of(otro));
        when(passwordEncoder.encode(anyString())).thenReturn("hash-nuevo");
        when(administradorRepository.save(otro)).thenReturn(otro);

        administradorService.reenviarInvitacion(2L);

        assertThat(otro.getPasswordHash()).isEqualTo("hash-nuevo");
        assertThat(otro.isPasswordProvisional()).isTrue();
        verify(correoService).enviarBienvenidaAdministrador(any(), eq(otro.getEmail()), anyString());
    }

    @Test
    void unAdministradorPuedeListarLosAdministradores() {
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findAll()).thenReturn(List.of(administrador(1L), administrador(2L)));

        assertThat(administradorService.listar()).hasSize(2);
    }

    @Test
    void unaJuntaNoPuedeListarLosAdministradores() {
        autenticarComo(2L, "JUNTA");

        assertThatThrownBy(() -> administradorService.listar()).isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void unaJuntaNoPuedeCrearAdministradores() {
        // Escalada de privilegios: cualquier usuario autenticado podría
        // llamar al endpoint, el servicio debe impedirlo.
        autenticarComo(2L, "JUNTA");

        assertThatThrownBy(() -> administradorService.crear(new AdministradorRequest("X", "x@test.es", null)))
                .isInstanceOf(AccesoDenegadoException.class);
        verify(administradorRepository, never()).save(any());
    }

    // --- bootstrap del primer administrador ---

    @Test
    void bootstrapCreaElPrimerAdministradorConElSecretoCorrecto() {
        when(administradorRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode("Clave.123")).thenReturn("hash");
        when(administradorRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        Administrador creado = administradorService.crearBootstrap(
                new AdministradorBootstrapRequest(SECRETO_BOOTSTRAP, "primero@test.es", "Clave.123"));

        assertThat(creado.getEmail()).isEqualTo("primero@test.es");
    }

    @Test
    void bootstrapConSecretoIncorrectoFalla() {
        assertThatThrownBy(() -> administradorService.crearBootstrap(
                new AdministradorBootstrapRequest("secreto-falso", "x@test.es", "Clave.123")))
                .isInstanceOf(CredencialesInvalidasException.class);
        verify(administradorRepository, never()).save(any());
    }

    @Test
    void bootstrapSeDesactivaSiYaExisteUnAdministrador() {
        when(administradorRepository.count()).thenReturn(1L);

        assertThatThrownBy(() -> administradorService.crearBootstrap(
                new AdministradorBootstrapRequest(SECRETO_BOOTSTRAP, "x@test.es", "Clave.123")))
                .isInstanceOf(RecursoDuplicadoException.class);
        verify(administradorRepository, never()).save(any());
    }

    // --- perfil propio ---

    @Test
    void actualizarPerfilPropioCambiaDatosYContrasena() {
        Administrador admin = administrador(1L);
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("Actual.1", "hash")).thenReturn(true);
        when(passwordEncoder.encode("Nueva.123")).thenReturn("hash-nuevo");
        when(administradorRepository.save(admin)).thenReturn(admin);

        administradorService.actualizarPerfilPropio(
                new AdministradorPerfilRequest("Elena", "600000000", "Actual.1", "Nueva.123"));

        assertThat(admin.getNombre()).isEqualTo("Elena");
        assertThat(admin.getPasswordHash()).isEqualTo("hash-nuevo");
    }

    @Test
    void actualizarPerfilPropioSinContrasenaNuevaMantieneLaAnterior() {
        Administrador admin = administrador(1L);
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(admin));
        when(passwordEncoder.matches("Actual.1", "hash")).thenReturn(true);
        when(administradorRepository.save(admin)).thenReturn(admin);

        administradorService.actualizarPerfilPropio(new AdministradorPerfilRequest("Elena", null, "Actual.1", ""));

        assertThat(admin.getPasswordHash()).isEqualTo("hash");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void actualizarPerfilPropioExigeLaContrasenaActual() {
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(administrador(1L)));
        when(passwordEncoder.matches("mala", "hash")).thenReturn(false);

        assertThatThrownBy(() -> administradorService.actualizarPerfilPropio(
                new AdministradorPerfilRequest("Elena", null, "mala", null)))
                .isInstanceOf(CredencialesInvalidasException.class);
        verify(administradorRepository, never()).save(any());
    }

    @Test
    void noSePuedeCrearUnAdministradorConUnEmailYaRegistrado() {
        autenticarComo(1L, "ADMIN");
        when(usuarioRepository.existsByEmailIgnoreCase("ana@test.es")).thenReturn(true);

        assertThatThrownBy(() -> administradorService.crear(new AdministradorRequest("Ana", "ana@test.es", null)))
                .isInstanceOf(RecursoDuplicadoException.class)
                .hasMessageContaining("ana@test.es");
        verify(administradorRepository, never()).save(any());
    }

    @Test
    void elBootstrapTambienRechazaUnEmailYaRegistrado() {
        when(administradorRepository.count()).thenReturn(0L);
        when(usuarioRepository.existsByEmailIgnoreCase("ana@test.es")).thenReturn(true);

        assertThatThrownBy(() -> administradorService.crearBootstrap(
                new AdministradorBootstrapRequest(SECRETO_BOOTSTRAP, "ana@test.es", "Clave.123")))
                .isInstanceOf(RecursoDuplicadoException.class);
    }

    // --- eliminar / consultar: solo Administrador ---

    @ParameterizedTest
    @ValueSource(strings = {"JUNTA", "COFRADE"})
    void soloUnAdministradorPuedeEliminarAdministradores(String rol) {
        autenticarComo(5L, rol);

        assertThatThrownBy(() -> administradorService.eliminar(1L)).isInstanceOf(AccesoDenegadoException.class);
        verify(administradorRepository, never()).delete(any());
    }

    @Test
    void unAdministradorPuedeEliminarOtro() {
        autenticarComo(1L, "ADMIN");
        when(administradorRepository.findById(1L)).thenReturn(Optional.of(administrador(1L)));
        Administrador otro = administrador(2L);
        when(administradorRepository.findById(2L)).thenReturn(Optional.of(otro));

        administradorService.eliminar(2L);

        verify(administradorRepository).delete(otro);
    }

    @Test
    void unAdministradorNoPuedeEliminarseASiMismo() {
        autenticarComo(1L, "ADMIN");

        assertThatThrownBy(() -> administradorService.eliminar(1L))
                .isInstanceOf(AccesoDenegadoException.class)
                .hasMessageContaining("propia cuenta");
        verify(administradorRepository, never()).delete(any());
    }

    @Test
    void losDatosDeUnAdministradorSoloLosConsultaOtroAdministrador() {
        autenticarComo(2L, "JUNTA");

        assertThatThrownBy(() -> administradorService.consultar(1L)).isInstanceOf(AccesoDenegadoException.class);
    }

    @Test
    void obtenerUnAdministradorInexistenteDevuelve404() {
        when(administradorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> administradorService.obtener(99L))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }
}
