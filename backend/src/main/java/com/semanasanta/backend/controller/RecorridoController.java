package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.PuntoRutaResponse;
import com.semanasanta.backend.dto.RecorridoRequest;
import com.semanasanta.backend.dto.RecorridoResponse;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.service.PuntoRutaService;
import com.semanasanta.backend.service.RecorridoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recorridos")
public class RecorridoController {

    private final RecorridoService recorridoService;
    private final PuntoRutaService puntoRutaService;

    public RecorridoController(RecorridoService recorridoService, PuntoRutaService puntoRutaService) {
        this.recorridoService = recorridoService;
        this.puntoRutaService = puntoRutaService;
    }

    @GetMapping
    public List<RecorridoResponse> listar() {
        return recorridoService.listar().stream()
                .map(RecorridoResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public RecorridoResponse obtener(@PathVariable Long id) {
        Recorrido recorrido = recorridoService.obtener(id);
        return RecorridoResponse.from(recorrido);
    }

    // Anidado bajo /recorridos porque un punto de ruta solo tiene sentido
    // "dentro de" un recorrido concreto y ordenado (a diferencia de crear un
    // punto, que sigue siendo POST /puntos-ruta con recorridoId en el body,
    // igual que el resto de entidades).
    @GetMapping("/{id}/puntos-ruta")
    public List<PuntoRutaResponse> listarPuntosRuta(@PathVariable Long id) {
        return puntoRutaService.listarDeRecorrido(id).stream()
                .map(PuntoRutaResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecorridoResponse crear(@Valid @RequestBody RecorridoRequest request) {
        Recorrido recorrido = recorridoService.crear(request);
        return RecorridoResponse.from(recorrido);
    }

    @PutMapping("/{id}")
    public RecorridoResponse actualizar(@PathVariable Long id, @Valid @RequestBody RecorridoRequest request) {
        Recorrido recorrido = recorridoService.actualizar(id, request);
        return RecorridoResponse.from(recorrido);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recorridoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
