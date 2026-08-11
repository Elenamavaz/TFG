package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.PuntoDeInteresRequest;
import com.semanasanta.backend.dto.PuntoRutaResponse;
import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.service.PuntoDeInteresService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/puntos-de-interes")
public class PuntoDeInteresController {

    private final PuntoDeInteresService puntoDeInteresService;

    public PuntoDeInteresController(PuntoDeInteresService puntoDeInteresService) {
        this.puntoDeInteresService = puntoDeInteresService;
    }

    @GetMapping("/{id}")
    public PuntoRutaResponse obtener(@PathVariable Long id) {
        PuntoDeInteres puntoDeInteres = puntoDeInteresService.obtener(id);
        return PuntoRutaResponse.from(puntoDeInteres);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PuntoRutaResponse crear(@Valid @RequestBody PuntoDeInteresRequest request) {
        PuntoDeInteres puntoDeInteres = puntoDeInteresService.crear(request);
        return PuntoRutaResponse.from(puntoDeInteres);
    }

    @PutMapping("/{id}")
    public PuntoRutaResponse actualizar(@PathVariable Long id, @Valid @RequestBody PuntoDeInteresRequest request) {
        PuntoDeInteres puntoDeInteres = puntoDeInteresService.actualizar(id, request);
        return PuntoRutaResponse.from(puntoDeInteres);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        puntoDeInteresService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
