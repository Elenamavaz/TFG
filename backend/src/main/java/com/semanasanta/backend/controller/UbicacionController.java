package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.UbicacionRequest;
import com.semanasanta.backend.dto.UbicacionResponse;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.service.UbicacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ubicaciones")
public class UbicacionController {

    private final UbicacionService ubicacionService;

    public UbicacionController(UbicacionService ubicacionService) {
        this.ubicacionService = ubicacionService;
    }

    @GetMapping
    public List<UbicacionResponse> listar() {
        return ubicacionService.listar().stream()
                .map(UbicacionResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public UbicacionResponse obtener(@PathVariable Long id) {
        Ubicacion ubicacion = ubicacionService.obtener(id);
        return UbicacionResponse.from(ubicacion);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UbicacionResponse crear(@Valid @RequestBody UbicacionRequest request) {
        Ubicacion ubicacion = ubicacionService.crear(request);
        return UbicacionResponse.from(ubicacion);
    }

    @PutMapping("/{id}")
    public UbicacionResponse actualizar(@PathVariable Long id, @Valid @RequestBody UbicacionRequest request) {
        Ubicacion ubicacion = ubicacionService.actualizar(id, request);
        return UbicacionResponse.from(ubicacion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ubicacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
