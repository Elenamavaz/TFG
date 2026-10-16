package com.semanasanta.backend.security;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private static final String SECRETO = "clave-de-pruebas-con-al-menos-32-caracteres-de-largo";

    private final JwtService jwtService = new JwtService(SECRETO, 60_000);

    @Test
    void elTokenGeneradoContieneElIdYElRol() {
        String token = jwtService.generarToken(7L, "JUNTA");

        Claims claims = jwtService.validarYExtraerClaims(token);

        assertThat(claims).isNotNull();
        assertThat(claims.getSubject()).isEqualTo("7");
        assertThat(claims.get("rol", String.class)).isEqualTo("JUNTA");
        assertThat(claims.getExpiration()).isAfter(claims.getIssuedAt());
    }

    @Test
    void unTokenManipuladoNoEsValido() {
        String token = jwtService.generarToken(7L, "JUNTA");
        String manipulado = token.substring(0, token.length() - 2) + "xx";

        assertThat(jwtService.validarYExtraerClaims(manipulado)).isNull();
    }

    @Test
    void unTokenFirmadoConOtraClaveNoEsValido() {
        JwtService otroServidor = new JwtService("otra-clave-distinta-con-al-menos-32-caracteres!!", 60_000);
        String tokenAjeno = otroServidor.generarToken(1L, "ADMIN");

        assertThat(jwtService.validarYExtraerClaims(tokenAjeno)).isNull();
    }

    @Test
    void unTokenCaducadoNoEsValido() {
        JwtService caducaAlInstante = new JwtService(SECRETO, -1_000);
        String token = caducaAlInstante.generarToken(1L, "ADMIN");

        assertThat(jwtService.validarYExtraerClaims(token)).isNull();
    }

    @Test
    void textoArbitrarioNoEsUnTokenValido() {
        assertThat(jwtService.validarYExtraerClaims("no-es-un-jwt")).isNull();
        assertThat(jwtService.validarYExtraerClaims("")).isNull();
    }
}
