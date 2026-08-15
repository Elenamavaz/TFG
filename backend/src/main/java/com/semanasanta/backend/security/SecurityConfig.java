package com.semanasanta.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
// gana el primer matcher que encaja).
//
// Excepción simétrica para escrituras: /administradores/bootstrap es
// permitAll aunque sea un POST -es la única vía para crear el primer
// Administrador, cuando literalmente nadie puede autenticarse todavía (ver
// AdministradorService.crearBootstrap, que se autoprotege con un secreto de
// despliegue y se autodesactiva en cuanto existe ya un Administrador).
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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                // API stateless: cada petición se autentica con su propio JWT,
                // no hay sesión de servidor que mantener entre peticiones.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/administradores/bootstrap").permitAll()
                        .requestMatchers(HttpMethod.GET, "/codigos-acceso/**", "/cofradias/*/codigos-acceso").authenticated()
                        .requestMatchers(HttpMethod.GET, "/**").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
