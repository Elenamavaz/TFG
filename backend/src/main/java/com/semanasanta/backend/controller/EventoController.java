package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.CancelarProcesionRequest;
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

    // ciudadId y cofradiaId opcionales y mutuamente excluyentes en la
    // práctica (el cliente usa uno u otro según la pantalla); sin ninguno,
    // todos -se mantiene por compatibilidad con quien ya llamara sin filtro.
    @GetMapping
    public List<EventoResponse> listar(@RequestParam(required = false) Long ciudadId,
                                        @RequestParam(required = false) Long cofradiaId) {
        List<Evento> eventos;
        if (ciudadId != null) {
            eventos = eventoService.listarDeCiudad(ciudadId);
        } else if (cofradiaId != null) {
            eventos = eventoService.listarDeCofradia(cofradiaId);
        } else {
            eventos = eventoService.listar();
        }
        return eventos.stream()
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

    // El evento sigue existiendo, solo cambia de estado -mismo patrón que
    // ProcesionController.cancelar (2026-08-23).
    @PostMapping("/{id}/cancelar")
    public EventoResponse cancelar(@PathVariable Long id, @Valid @RequestBody CancelarProcesionRequest request) {
        Evento evento = eventoService.cancelar(id, request);
        return EventoResponse.from(evento);
    }
}
