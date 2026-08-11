package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.PosicionActualRequest;
import com.semanasanta.backend.dto.PosicionActualResponse;
import com.semanasanta.backend.dto.ProcesionRequest;
import com.semanasanta.backend.dto.ProcesionResponse;
import com.semanasanta.backend.model.PosicionActual;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.service.PosicionActualService;
import com.semanasanta.backend.service.ProcesionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/procesiones")
public class ProcesionController {

    private final ProcesionService procesionService;
    private final PosicionActualService posicionActualService;

    public ProcesionController(ProcesionService procesionService, PosicionActualService posicionActualService) {
        this.procesionService = procesionService;
        this.posicionActualService = posicionActualService;
    }

    @GetMapping
    public List<ProcesionResponse> listar() {
        return procesionService.listar().stream()
                .map(ProcesionResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ProcesionResponse obtener(@PathVariable Long id) {
        Procesion procesion = procesionService.obtener(id);
        return ProcesionResponse.from(procesion);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProcesionResponse crear(@Valid @RequestBody ProcesionRequest request) {
        Procesion procesion = procesionService.crear(request);
        return ProcesionResponse.from(procesion);
    }

    @PutMapping("/{id}")
    public ProcesionResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProcesionRequest request) {
        Procesion procesion = procesionService.actualizar(id, request);
        return ProcesionResponse.from(procesion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        procesionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // Nombre literal del Apéndice C: "la aplicación cliente consulta esta
    // posición mediante GET /procesiones/{id}/ubicacion".
    @GetMapping("/{id}/ubicacion")
    public PosicionActualResponse ubicacionActual(@PathVariable Long id) {
        PosicionActual posicion = posicionActualService.actual(id);
        return PosicionActualResponse.from(posicion);
    }

    @GetMapping("/{id}/posiciones")
    public List<PosicionActualResponse> historicoPosiciones(@PathVariable Long id) {
        return posicionActualService.historico(id).stream()
                .map(PosicionActualResponse::from)
                .toList();
    }

    @PostMapping("/{id}/posiciones")
    @ResponseStatus(HttpStatus.CREATED)
    public PosicionActualResponse registrarPosicion(@PathVariable Long id,
                                                      @Valid @RequestBody PosicionActualRequest request) {
        PosicionActual posicion = posicionActualService.registrar(id, request);
        return PosicionActualResponse.from(posicion);
    }
}
