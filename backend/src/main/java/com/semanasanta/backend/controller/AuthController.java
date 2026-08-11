package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.AuthResponse;
import com.semanasanta.backend.dto.CodigoAccesoLoginRequest;
import com.semanasanta.backend.dto.LoginRequest;
import com.semanasanta.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.email(), request.password());
    }

    @PostMapping("/codigo-acceso")
    public AuthResponse loginConCodigoAcceso(@Valid @RequestBody CodigoAccesoLoginRequest request) {
        return authService.loginConCodigoAcceso(request.codigo());
    }
}
