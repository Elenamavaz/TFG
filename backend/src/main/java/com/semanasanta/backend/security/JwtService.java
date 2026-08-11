package com.semanasanta.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

// Genera y valida los JWT (Sección 4.1 "Security" de la memoria). El token
// lleva el id del Usuario como subject y el rol como claim propio -así el
// filtro no necesita ir a la base de datos en cada petición para saber quién
// es y qué puede hacer, solo para operaciones que necesiten el objeto
// completo (p.ej. comparar la ciudad de una Junta).
@Component
public class JwtService {

    private final SecretKey clave;
    private final long expiracionMs;

    public JwtService(@Value("${jwt.secret}") String secreto, @Value("${jwt.expiration-ms}") long expiracionMs) {
        this.clave = Keys.hmacShaKeyFor(secreto.getBytes(StandardCharsets.UTF_8));
        this.expiracionMs = expiracionMs;
    }

    public String generarToken(Long usuarioId, String rol) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + expiracionMs);
        return Jwts.builder()
                .subject(usuarioId.toString())
                .claim("rol", rol)
                .issuedAt(ahora)
                .expiration(expiracion)
                .signWith(clave)
                .compact();
    }

    // null si el token no es válido o ha caducado, en vez de lanzar excepción:
    // el filtro lo usa para decidir "sigue sin autenticar" sin más ceremonia.
    public Claims validarYExtraerClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(clave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception ex) {
            return null;
        }
    }
}
