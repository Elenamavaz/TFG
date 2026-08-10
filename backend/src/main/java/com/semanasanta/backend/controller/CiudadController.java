package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.CiudadRequest;
import com.semanasanta.backend.dto.CiudadResponse;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.service.CiudadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ciudades")
public class CiudadController {

    private final CiudadService ciudadService;

    public CiudadController(CiudadService ciudadService) {
        this.ciudadService = ciudadService;
    }

    @GetMapping
    public List<CiudadResponse> listar() {
        return ciudadService.listar().stream()
                .map(CiudadResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public CiudadResponse obtener(@PathVariable Long id) {
        Ciudad ciudad = ciudadService.obtener(id);
        return CiudadResponse.from(ciudad);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CiudadResponse crear(@Valid @RequestBody CiudadRequest request) {
        Ciudad ciudad = ciudadService.crear(request);
        return CiudadResponse.from(ciudad);
    }

    @PutMapping("/{id}")
    public CiudadResponse actualizar(@PathVariable Long id, @Valid @RequestBody CiudadRequest request) {
        Ciudad ciudad = ciudadService.actualizar(id, request);
        return CiudadResponse.from(ciudad);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ciudadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
