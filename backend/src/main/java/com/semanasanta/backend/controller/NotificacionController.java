package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.AlertaRequest;
import com.semanasanta.backend.dto.AvisoRequest;
import com.semanasanta.backend.dto.NotificacionResponse;
import com.semanasanta.backend.model.Notificacion;
import com.semanasanta.backend.service.NotificacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    // Público (RI-01): el ciudadano sin login consulta las notificaciones de
    // la ciudad que está mirando en la app. Junta/Admin usan este mismo
    // listado (sin bandeja de entrada propia ni estado leída/no-leída: no
    // aporta lo bastante frente a la complejidad de mantenerlo, ver
    // decisión del 2026-08-14 -- eliminada NotificacionEntregada).
    @GetMapping
    public List<NotificacionResponse> listarDeCiudad(@RequestParam Long ciudadId) {
        return notificacionService.listarDeCiudad(ciudadId).stream()
                .map(NotificacionResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public NotificacionResponse obtener(@PathVariable Long id) {
        Notificacion notificacion = notificacionService.obtener(id);
        return NotificacionResponse.from(notificacion);
    }

    @PostMapping("/avisos")
    @ResponseStatus(HttpStatus.CREATED)
    public NotificacionResponse crearAviso(@Valid @RequestBody AvisoRequest request) {
        return NotificacionResponse.from(notificacionService.crearAviso(request));
    }

    @PostMapping("/alertas")
    @ResponseStatus(HttpStatus.CREATED)
    public NotificacionResponse crearAlerta(@Valid @RequestBody AlertaRequest request) {
        return NotificacionResponse.from(notificacionService.crearAlerta(request));
    }

    // No hay PUT: una notificación ya enviada no se edita (ver Notificacion).
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
