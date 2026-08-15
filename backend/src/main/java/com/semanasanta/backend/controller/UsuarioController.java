package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.CambiarPasswordRequest;
import com.semanasanta.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Deliberadamente fuera de "/auth/**": esa ruta es permitAll en
// SecurityConfig (login no puede exigir estar ya autenticado), y este
// endpoint es justo lo contrario -necesita saber QUIÉN hace la petición
// (AuthService.cambiarPassword lee el usuario del JWT), así que cae en la
// regla por defecto de SecurityConfig ("cualquier escritura exige JWT").
@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final AuthService authService;

    public UsuarioController(AuthService authService) {
        this.authService = authService;
    }

    @PutMapping("/password")
    public ResponseEntity<Void> cambiarPassword(@Valid @RequestBody CambiarPasswordRequest request) {
        authService.cambiarPassword(request.passwordActual(), request.passwordNueva());
        return ResponseEntity.noContent().build();
    }
}
