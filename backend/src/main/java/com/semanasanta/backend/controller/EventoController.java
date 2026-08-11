package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.EventoRequest;
import com.semanasanta.backend.dto.EventoResponse;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/eventos")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @GetMapping
    public List<EventoResponse> listar() {
        return eventoService.listar().stream()
                .map(EventoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public EventoResponse obtener(@PathVariable Long id) {
        Evento evento = eventoService.obtener(id);
        return EventoResponse.from(evento);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventoResponse crear(@Valid @RequestBody EventoRequest request) {
        Evento evento = eventoService.crear(request);
        return EventoResponse.from(evento);
    }

    @PutMapping("/{id}")
    public EventoResponse actualizar(@PathVariable Long id, @Valid @RequestBody EventoRequest request) {
        Evento evento = eventoService.actualizar(id, request);
        return EventoResponse.from(evento);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        eventoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
