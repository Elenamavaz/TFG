package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.CiudadInformacionRequest;
import com.semanasanta.backend.dto.CiudadRequest;
import com.semanasanta.backend.dto.CiudadResponse;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.service.CiudadService;
import com.semanasanta.backend.service.InformacionCiudadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ciudades")
public class CiudadController {

    private final CiudadService ciudadService;
    private final InformacionCiudadService informacionCiudadService;

    public CiudadController(CiudadService ciudadService, InformacionCiudadService informacionCiudadService) {
        this.ciudadService = ciudadService;
        this.informacionCiudadService = informacionCiudadService;
    }

    // incluirInactivas=true es lo que usa el panel de Administrador para ver
    // también las ciudades desactivadas (y poder reactivarlas); el
    // ciudadano nunca lo manda, así que sigue viendo solo las activas.
    @GetMapping
    public List<CiudadResponse> listar(@RequestParam(defaultValue = "false") boolean incluirInactivas) {
        return ciudadService.listar(incluirInactivas).stream()
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

    // Junta de esa ciudad (2026-10-03): solo historia y patrimonio, ver
    // InformacionCiudadService. El PUT completo de arriba sigue siendo solo
    // del Administrador.
    @PutMapping("/{id}/informacion")
    public CiudadResponse actualizarInformacion(@PathVariable Long id, @RequestBody CiudadInformacionRequest request) {
        Ciudad ciudad = informacionCiudadService.actualizarInformacion(id, request);
        return CiudadResponse.from(ciudad);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ciudadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
