package com.semanasanta.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

// TODO(auth JWT): esta configuración es TEMPORAL, solo para poder probar los
// endpoints mientras no existe el filtro JWT descrito en la memoria (Sección 4.1
// "Estructura del back-end" -> Security). Cuando se implemente la autenticación
// por código de acceso / JWT, esto pasa a exigir token salvo en /auth/** y
// /swagger-ui/**, /v3/api-docs/**.
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }
}
