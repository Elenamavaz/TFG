package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.AuthResponse;
import com.semanasanta.backend.dto.PosicionActualResponse;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.exception.ProcesionNoEnCursoException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.CodigoAcceso;
import com.semanasanta.backend.security.JwtService;
import com.semanasanta.backend.security.SecurityConfig;
import com.semanasanta.backend.service.AdministradorService;
import com.semanasanta.backend.service.AuthService;
import com.semanasanta.backend.service.CiudadService;
import com.semanasanta.backend.service.CodigoAccesoService;
import com.semanasanta.backend.service.DispositivoPushService;
import com.semanasanta.backend.service.InformacionCiudadService;
import com.semanasanta.backend.service.MiembroJuntaCofradiaService;
import com.semanasanta.backend.service.PosicionActualService;
import com.semanasanta.backend.service.ProcesionService;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.util.List;

import static com.semanasanta.backend.support.DatosPrueba.*;
import static org.hamcrest.Matchers.startsWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// Pruebas de integración de la capa web: levanta los controladores con la
// configuración de seguridad REAL (SecurityConfig + JwtAuthenticationFilter +
// JwtService) y GlobalExceptionHandler, pero con los servicios simulados
// -no hace falta base de datos-. Comprueba lo que ve un cliente HTTP:
// qué rutas son públicas, cuáles exigen JWT, y qué código de estado
// devuelve cada error.
@WebMvcTest(controllers = {
        AuthController.class, CiudadController.class, CodigoAccesoController.class,
        ProcesionController.class, AdministradorController.class, DispositivoPushController.class,
        MiembroJuntaCofradiaController.class
})
@Import({SecurityConfig.class, JwtService.class})
class SeguridadApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private AuthService authService;
    @MockitoBean
    private CiudadService ciudadService;
    @MockitoBean
    private InformacionCiudadService informacionCiudadService;
    @MockitoBean
    private CodigoAccesoService codigoAccesoService;
    @MockitoBean
    private ProcesionService procesionService;
    @MockitoBean
    private PosicionActualService posicionActualService;
    @MockitoBean
    private AdministradorService administradorService;
    @MockitoBean
    private DispositivoPushService dispositivoPushService;
    @MockitoBean
    private MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    private static final String CIUDAD_JSON = """
            {"nombre":"Valladolid","comunidadAutonoma":"Castilla y León","provincia":"Valladolid",
             "activa":true,"latitud":41.65,"longitud":-4.72}
            """;

    private MockHttpServletRequestBuilder conToken(MockHttpServletRequestBuilder peticion, String rol) {
        return peticion.header("Authorization", "Bearer " + jwtService.generarToken(1L, rol));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder peticion, String cuerpo) {
        return peticion.contentType(MediaType.APPLICATION_JSON).content(cuerpo);
    }

    @Nested
    class RutasPublicas {

        @Test
        void elCiudadanoConsultaLasCiudadesSinIniciarSesion() throws Exception {
            when(ciudadService.listar(false)).thenReturn(List.of(ciudad(1L)));

            mockMvc.perform(get("/ciudades"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$[0].id").value(1))
                    .andExpect(jsonPath("$[0].nombre").value("Ciudad 1"));
        }

        @Test
        void elLoginEsPublico() throws Exception {
            when(authService.login("a@test.es", "Clave.123"))
                    .thenReturn(new AuthResponse("token", "ADMIN", 1L, true, false));

            mockMvc.perform(json(post("/auth/login"), """
                            {"email":"a@test.es","password":"Clave.123"}"""))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.token").value("token"))
                    .andExpect(jsonPath("$.rol").value("ADMIN"));
        }

        @Test
        void elBootstrapDelPrimerAdministradorNoExigeToken() throws Exception {
            when(administradorService.crearBootstrap(any())).thenReturn(administrador(1L));

            mockMvc.perform(json(post("/administradores/bootstrap"), """
                            {"secreto":"s","email":"admin@test.es","password":"Clave.123"}"""))
                    .andExpect(status().isCreated());
        }

        @Test
        void elCiudadanoRegistraSuDispositivoPushSinToken() throws Exception {
            mockMvc.perform(json(post("/dispositivos-push"), """
                            {"token":"ExponentPushToken[abc]","ciudadId":1}"""))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    class RutasProtegidas {

        @Test
        void escribirSinTokenSeRechazaSinLlegarAlServicio() throws Exception {
            // 401 (no 403) y marcado como sesión inválida: así la app sabe
            // que tiene que volver a pedir el inicio de sesión (bug 8).
            mockMvc.perform(json(post("/ciudades"), CIUDAD_JSON))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.sesionInvalida").value(true))
                    .andExpect(jsonPath("$.mensaje").value(startsWith("Tu sesión ha caducado")));

            verify(ciudadService, never()).crear(any());
        }

        @Test
        void eliminarSinTokenSeRechaza() throws Exception {
            mockMvc.perform(delete("/ciudades/1"))
                    .andExpect(status().isUnauthorized());

            verify(ciudadService, never()).eliminar(any());
        }

        @Test
        void unTokenFalsoSeTrataComoSinSesion() throws Exception {
            mockMvc.perform(json(post("/ciudades"), CIUDAD_JSON).header("Authorization", "Bearer token-inventado"))
                    .andExpect(status().isUnauthorized());

            verify(ciudadService, never()).crear(any());
        }

        @Test
        void conUnTokenValidoLaPeticionLlegaAlServicio() throws Exception {
            when(ciudadService.crear(any())).thenReturn(ciudad(1L));

            mockMvc.perform(conToken(json(post("/ciudades"), CIUDAD_JSON), "ADMIN"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.nombre").value("Ciudad 1"));
        }

        @Test
        void losCodigosDeAccesoNoSonPublicosAunqueSeanGet() throws Exception {
            mockMvc.perform(get("/codigos-acceso/8"))
                    .andExpect(status().isUnauthorized());

            verify(codigoAccesoService, never()).obtener(any());
        }

        @Test
        void losDatosPersonalesDeAdministradoresYMiembrosNoSonPublicos() throws Exception {
            mockMvc.perform(get("/administradores/1")).andExpect(status().isUnauthorized());
            mockMvc.perform(get("/miembros-junta/2")).andExpect(status().isUnauthorized());

            verify(administradorService, never()).consultar(any());
            verify(miembroJuntaCofradiaService, never()).consultar(any());
        }

        @Test
        void conSesionLaConsultaDeUnMiembroPasaPorElControlDePermisos() throws Exception {
            when(miembroJuntaCofradiaService.consultar(2L)).thenReturn(miembro(2L, junta(1L, ciudad(1L))));

            mockMvc.perform(conToken(get("/miembros-junta/2"), "JUNTA"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("miembro2@test.es"));
        }

        @Test
        void laJuntaConsultaUnCodigoDeAccesoConSuToken() throws Exception {
            CodigoAcceso codigo = conId(new CodigoAcceso("ABCD1234", cofradia(3L, ciudad(1L))), 8L);
            when(codigoAccesoService.obtener(8L)).thenReturn(codigo);

            mockMvc.perform(conToken(get("/codigos-acceso/8"), "JUNTA"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.codigo").value("ABCD1234"))
                    .andExpect(jsonPath("$.estado").value("EMITIDO"));
        }
    }

    @Nested
    class TraduccionDeErroresAHttp {

        @Test
        void recursoNoEncontradoDevuelve404ConMensaje() throws Exception {
            when(ciudadService.obtener(99L)).thenThrow(new RecursoNoEncontradoException("No existe la ciudad con id 99"));

            mockMvc.perform(get("/ciudades/99"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.mensaje").value("No existe la ciudad con id 99"));
        }

        @Test
        void accesoDenegadoDevuelve403() throws Exception {
            when(ciudadService.crear(any())).thenThrow(new AccesoDenegadoException("Solo Administrador"));

            mockMvc.perform(conToken(json(post("/ciudades"), CIUDAD_JSON), "JUNTA"))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.mensaje").value("Solo Administrador"));
        }

        @Test
        void credencialesInvalidasDevuelve401() throws Exception {
            when(authService.login(any(), any())).thenThrow(new CredencialesInvalidasException("Email o contraseña incorrectos"));

            mockMvc.perform(json(post("/auth/login"), """
                            {"email":"a@test.es","password":"mala"}"""))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.mensaje").value("Email o contraseña incorrectos"));
        }

        @Test
        void recursoDuplicadoDevuelve409() throws Exception {
            when(administradorService.crearBootstrap(any())).thenThrow(new RecursoDuplicadoException("Ya existe"));

            mockMvc.perform(json(post("/administradores/bootstrap"), """
                            {"secreto":"s","email":"admin@test.es","password":"Clave.123"}"""))
                    .andExpect(status().isConflict());
        }

        @Test
        void eliminarAlgoConDatosAsociadosDevuelve409ConMensajeEnVezDe500() throws Exception {
            doThrow(new DataIntegrityViolationException("fk"))
                    .when(ciudadService).eliminar(1L);

            mockMvc.perform(conToken(delete("/ciudades/1"), "ADMIN"))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.mensaje").value(startsWith("No se puede eliminar")));
        }

        @Test
        void unaContrasenaIncorrectaEsUn401SinMarcaDeSesionInvalida() throws Exception {
            // Para que la app no cierre la sesión por un simple error de contraseña.
            when(authService.login(any(), any())).thenThrow(new CredencialesInvalidasException("Email o contraseña incorrectos"));

            mockMvc.perform(json(post("/auth/login"), """
                            {"email":"a@test.es","password":"mala"}"""))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.sesionInvalida").doesNotExist());
        }

        @Test
        void pingAProcesionQueYaNoEstaEnCursoDevuelve410() throws Exception {
            when(posicionActualService.registrarPing(10L, 41.65, -4.72)).thenThrow(new ProcesionNoEnCursoException());

            mockMvc.perform(conToken(json(post("/procesiones/10/posiciones"), """
                            {"latitud":41.65,"longitud":-4.72}"""), "COFRADE"))
                    .andExpect(status().isGone());
        }
    }

    @Nested
    class ValidacionDeDatosDeEntrada {

        @Test
        void loginSinCamposObligatoriosDevuelve400ConElErrorDeCadaCampo() throws Exception {
            mockMvc.perform(json(post("/auth/login"), "{}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.email").value("El email es obligatorio"))
                    .andExpect(jsonPath("$.password").value("La contraseña es obligatoria"));

            verify(authService, never()).login(any(), any());
        }

        @Test
        void unaContrasenaDebilSeRechazaAntesDeLlegarAlServicio() throws Exception {
            mockMvc.perform(json(post("/administradores/bootstrap"), """
                            {"secreto":"s","email":"admin@test.es","password":"debil"}"""))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.password").exists());

            verify(administradorService, never()).crearBootstrap(any());
        }

        @Test
        void unEmailMalFormadoSeRechaza() throws Exception {
            mockMvc.perform(json(post("/administradores/bootstrap"), """
                            {"secreto":"s","email":"no-es-un-email","password":"Clave.123"}"""))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.email").value("El email no tiene un formato válido"));
        }

        @Test
        void unPingSinCoordenadasSeRechaza() throws Exception {
            mockMvc.perform(conToken(json(post("/procesiones/10/posiciones"), "{}"), "COFRADE"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.latitud").exists())
                    .andExpect(jsonPath("$.longitud").exists());
        }
    }

    @Nested
    class ErroresDeFormato {

        @Test
        void unCampoConFormatoInvalidoSeIndicaPorSuNombre() throws Exception {
            mockMvc.perform(conToken(json(post("/procesiones/10/posiciones"), """
                            {"latitud":"no-es-un-numero","longitud":-4.72}"""), "COFRADE"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensaje").value("El campo \"latitud\" no tiene un formato válido."));
        }

        @Test
        void unJsonMalFormadoDevuelveUnMensajeGenerico() throws Exception {
            mockMvc.perform(json(post("/auth/login"), "{esto no es json"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensaje").value("Los datos enviados no tienen un formato válido."));
        }

        @Test
        void unIdQueNoEsNumericoDevuelve400ConMensaje() throws Exception {
            mockMvc.perform(get("/ciudades/abc"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.mensaje").value("El parámetro \"id\" no tiene un formato válido."));
        }
    }

    @Nested
    class RegistroDePosiciones {

        @Test
        void unPingGuardadoDevuelve201() throws Exception {
            when(posicionActualService.registrarPing(10L, 41.65, -4.72))
                    .thenReturn(new PosicionActualResponse(1L, 41.65, -4.72, null, 10L, true));

            mockMvc.perform(conToken(json(post("/procesiones/10/posiciones"), """
                            {"latitud":41.65,"longitud":-4.72}"""), "COFRADE"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.guardado").value(true));
        }

        @Test
        void unPingDescartadoPorEstarFueraDelRecorridoDevuelve200() throws Exception {
            when(posicionActualService.registrarPing(10L, 40.0, -3.0))
                    .thenReturn(PosicionActualResponse.descartadoFueraDeRecorrido(10L, 40.0, -3.0));

            mockMvc.perform(conToken(json(post("/procesiones/10/posiciones"), """
                            {"latitud":40.0,"longitud":-3.0}"""), "COFRADE"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.guardado").value(false));
        }
    }
}
