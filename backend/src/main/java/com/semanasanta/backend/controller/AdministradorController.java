package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.AdministradorRequest;
import com.semanasanta.backend.dto.AdministradorResponse;
import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.service.AdministradorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/administradores")
public class AdministradorController {

    private final AdministradorService administradorService;

    public AdministradorController(AdministradorService administradorService) {
        this.administradorService = administradorService;
    }

    @GetMapping("/{id}")
    public AdministradorResponse obtener(@PathVariable Long id) {
        Administrador administrador = administradorService.obtener(id);
        return AdministradorResponse.from(administrador);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdministradorResponse crear(@Valid @RequestBody AdministradorRequest request) {
        Administrador administrador = administradorService.crear(request);
        return AdministradorResponse.from(administrador);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        administradorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
