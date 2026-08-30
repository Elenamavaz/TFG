package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.DispositivoPushRequest;
import com.semanasanta.backend.service.DispositivoPushService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dispositivos-push")
public class DispositivoPushController {

    private final DispositivoPushService dispositivoPushService;

    public DispositivoPushController(DispositivoPushService dispositivoPushService) {
        this.dispositivoPushService = dispositivoPushService;
    }

    // Público (ver SecurityConfig): el Ciudadano nunca se autentica, así que
    // este POST no lleva JWT -mismo trato que /administradores/bootstrap,
    // permitAll explícito antes de la regla general de "toda escritura
    // exige JWT". Sin cuerpo de respuesta: al cliente no le hace falta nada
    // de vuelta, solo saber que no ha fallado.
    @PostMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registrar(@Valid @RequestBody DispositivoPushRequest request) {
        dispositivoPushService.registrar(request);
    }
}
