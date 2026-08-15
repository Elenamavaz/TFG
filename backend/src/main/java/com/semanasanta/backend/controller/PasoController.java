package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.PasoRequest;
import com.semanasanta.backend.dto.PasoResponse;
import com.semanasanta.backend.model.Paso;
import com.semanasanta.backend.service.PasoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pasos")
public class PasoController {

    private final PasoService pasoService;

    public PasoController(PasoService pasoService) {
        this.pasoService = pasoService;
    }

    // cofradiaId opcional -Paso no es N:M, tiene una única cofradía dueña,
    // así que el filtro es directo. Sin él, todos.
    @GetMapping
    public List<PasoResponse> listar(@RequestParam(required = false) Long cofradiaId) {
        List<Paso> pasos = cofradiaId != null ? pasoService.listarDeCofradia(cofradiaId) : pasoService.listar();
        return pasos.stream()
                .map(PasoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public PasoResponse obtener(@PathVariable Long id) {
        Paso paso = pasoService.obtener(id);
        return PasoResponse.from(paso);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PasoResponse crear(@Valid @RequestBody PasoRequest request) {
        Paso paso = pasoService.crear(request);
        return PasoResponse.from(paso);
    }

    @PutMapping("/{id}")
    public PasoResponse actualizar(@PathVariable Long id, @Valid @RequestBody PasoRequest request) {
        Paso paso = pasoService.actualizar(id, request);
        return PasoResponse.from(paso);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pasoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
