package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.PuntoRutaRequest;
import com.semanasanta.backend.dto.PuntoRutaResponse;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.service.PuntoRutaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/puntos-ruta")
public class PuntoRutaController {

    private final PuntoRutaService puntoRutaService;

    public PuntoRutaController(PuntoRutaService puntoRutaService) {
        this.puntoRutaService = puntoRutaService;
    }

    @GetMapping("/{id}")
    public PuntoRutaResponse obtener(@PathVariable Long id) {
        PuntoRuta puntoRuta = puntoRutaService.obtener(id);
        return PuntoRutaResponse.from(puntoRuta);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PuntoRutaResponse crear(@Valid @RequestBody PuntoRutaRequest request) {
        PuntoRuta puntoRuta = puntoRutaService.crear(request);
        return PuntoRutaResponse.from(puntoRuta);
    }

    @PutMapping("/{id}")
    public PuntoRutaResponse actualizar(@PathVariable Long id, @Valid @RequestBody PuntoRutaRequest request) {
        PuntoRuta puntoRuta = puntoRutaService.actualizar(id, request);
        return PuntoRutaResponse.from(puntoRuta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        puntoRutaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
