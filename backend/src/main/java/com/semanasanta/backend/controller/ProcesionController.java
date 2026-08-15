package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.PosicionActualRequest;
import com.semanasanta.backend.dto.PosicionActualResponse;
import com.semanasanta.backend.dto.PosicionAgregadaResponse;
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

    // Mismo patrón que EventoController.listar.
    @GetMapping
    public List<ProcesionResponse> listar(@RequestParam(required = false) Long ciudadId,
                                           @RequestParam(required = false) Long cofradiaId) {
        List<Procesion> procesiones;
        if (ciudadId != null) {
            procesiones = procesionService.listarDeCiudad(ciudadId);
        } else if (cofradiaId != null) {
            procesiones = procesionService.listarDeCofradia(cofradiaId);
        } else {
            procesiones = procesionService.listar();
        }
        return procesiones.stream()
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
    // posición mediante GET /procesiones/{id}/ubicacion". Ahora es un valor
    // CALCULADO (promedio de pings recientes), no una fila guardada.
    @GetMapping("/{id}/ubicacion")
    public PosicionAgregadaResponse ubicacionActual(@PathVariable Long id) {
        return posicionActualService.actual(id);
    }

    @GetMapping("/{id}/posiciones")
    public List<PosicionActualResponse> historicoPosiciones(@PathVariable Long id) {
        return posicionActualService.historico(id).stream()
                .map(PosicionActualResponse::from)
                .toList();
    }

    // Un ping anónimo: quien lo manda demuestra con su JWT (rol COFRADE) que
    // validó un código de la cofradía de esta procesión, pero no se registra
    // quién es (ver PosicionActualService.exigirCofradeDeLaCofradia).
    @PostMapping("/{id}/posiciones")
    @ResponseStatus(HttpStatus.CREATED)
    public PosicionActualResponse registrarPosicion(@PathVariable Long id,
                                                      @Valid @RequestBody PosicionActualRequest request) {
        PosicionActual posicion = posicionActualService.registrarPing(id, request.latitud(), request.longitud());
        return PosicionActualResponse.from(posicion);
    }
}
