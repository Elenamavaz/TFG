package com.semanasanta.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.nio.charset.StandardCharsets;
import java.util.List;

// Reglas reales (sustituye al permitAll temporal): todo GET queda público
// -el ciudadano nunca se registra, consulta todo sin token (RI-01)-, y
// cualquier escritura (POST/PUT/DELETE) exige un JWT válido, salvo /auth/**
// (login) y la documentación de la API. El ROL concreto que hace falta para
// cada escritura -y las comprobaciones de "esta Junta gestiona esta
// ciudad"- se resuelven en la capa Service (ver los TODO ya marcados allí),
// no aquí: esto solo exige "estar autenticado", no "con qué rol".
//
// Excepción a "todo GET es público": los códigos de acceso son credenciales
// (el propio código es la contraseña del cofrade), listarlos no puede ser
// público aunque sea un GET -si no, cualquiera podría leer códigos ajenos-,
// así que sus rutas se excluyen ANTES de la regla general (el orden importa:
// gana el primer matcher que encaja). Mismo caso para los datos personales
// (email y teléfono) de Administradores y Miembros de Junta (2026-10-16):
// eran públicos; quién puede verlos lo decide después la capa Service.
//
// Excepción simétrica para escrituras: /administradores/bootstrap es
// permitAll aunque sea un POST -es la única vía para crear el primer
// Administrador, cuando literalmente nadie puede autenticarse todavía (ver
// AdministradorService.crearBootstrap, que se autoprotege con un secreto de
// despliegue y se autodesactiva en cuanto existe ya un Administrador).
// Mismo caso POST /dispositivos-push (2026-08-23): lo manda el Ciudadano
// para registrarse a las notificaciones push de su ciudad, y el Ciudadano
// nunca se autentica (RI-01) -no hay JWT que pedirle.
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // BCrypt, el algoritmo por defecto de Spring Security (memoria, Sección 4.1
    // "Diseño de la base de datos"): hashea password_hash de Administrador y
    // MiembroJuntaCofradia al crearlos.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // Sin esto, cualquier llamada desde un navegador (Expo Web -el cliente
    // React Native también compila a web-, o Swagger UI si se sirve aparte)
    // la bloquea el propio navegador por CORS antes de que le dé tiempo a
    // llegar aquí: app y API corren en orígenes distintos (puertos
    // distintos, como mínimo). Android/iOS nativos no pasan por el motor
    // CORS de un navegador, así que a ellos nunca les afectó -por eso no se
    // notó hasta conectar Expo Web (2026-08-15).
    //
    // allowedOriginPattern("*") en vez de una lista concreta: no hay un
    // origen web fijo (la app es nativa; Expo Web solo en desarrollo) y, sobre todo,
    // esta API no usa cookies de sesión (JWT en el header Authorization, que
    // el navegador nunca adjunta solo por cross-origin) -el origen abierto
    // no habilita el robo de sesión ajena que sí sería un problema con auth
    // por cookies.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuracion = new CorsConfiguration();
        configuracion.setAllowedOriginPatterns(List.of("*"));
        configuracion.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuracion.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuracion);
        return source;
    }

    // Sin esto, una petición sin JWT válido (o con uno caducado) a una ruta
    // protegida recibía un 403 vacío -indistinguible de "no tienes permiso"-,
    // y la app no podía saber que la sesión había caducado (bug 8 de
    // bugs.md, 2026-10-16). Ahora es 401 con el mismo formato que el resto de
    // errores (GlobalExceptionHandler.ErrorResponse) más "sesionInvalida",
    // para no confundirlo con el 401 de una contraseña incorrecta.
    private static final AuthenticationEntryPoint SESION_INVALIDA = (request, response, ex) -> {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(
                "{\"mensaje\":\"Tu sesión ha caducado o no es válida. Vuelve a iniciar sesión.\",\"sesionInvalida\":true}");
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // API stateless: cada petición se autentica con su propio JWT,
                // no hay sesión de servidor que mantener entre peticiones.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errores -> errores.authenticationEntryPoint(SESION_INVALIDA))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/administradores/bootstrap").permitAll()
                        .requestMatchers(HttpMethod.POST, "/dispositivos-push").permitAll()
                        .requestMatchers(HttpMethod.GET, "/codigos-acceso/**", "/cofradias/*/codigos-acceso").authenticated()
                        .requestMatchers(HttpMethod.GET, "/administradores/**", "/miembros-junta/**",
                                "/juntas-cofradias/*/miembros").authenticated()
                        .requestMatchers(HttpMethod.GET, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
