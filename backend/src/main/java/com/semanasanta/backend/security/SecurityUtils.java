package com.semanasanta.backend.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

// Acceso al UsuarioPrincipal autenticado desde dentro de un Service (no solo
// desde el Controller). SecurityContextHolder es thread-local: funciona
// porque JwtAuthenticationFilter lo rellena al principio de la misma
// petición/hilo en el que luego se ejecuta el Service.
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static UsuarioPrincipal usuarioActual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UsuarioPrincipal principal)) {
            throw new IllegalStateException("No hay ningún usuario autenticado en el contexto actual");
        }
        return principal;
    }
}
