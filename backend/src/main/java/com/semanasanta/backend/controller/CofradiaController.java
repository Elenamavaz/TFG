package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.CodigoAccesoRequest;
import com.semanasanta.backend.dto.CodigoAccesoResponse;
import com.semanasanta.backend.dto.CofradiaRequest;
import com.semanasanta.backend.dto.CofradiaResponse;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.CodigoAcceso;
import com.semanasanta.backend.service.CodigoAccesoService;
import com.semanasanta.backend.service.CofradiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cofradias")
public class CofradiaController {

    private final CofradiaService cofradiaService;
    private final CodigoAccesoService codigoAccesoService;

    public CofradiaController(CofradiaService cofradiaService, CodigoAccesoService codigoAccesoService) {
        this.cofradiaService = cofradiaService;
        this.codigoAccesoService = codigoAccesoService;
    }

    @GetMapping
    public List<CofradiaResponse> listar() {
        return cofradiaService.listar().stream()
                .map(CofradiaResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public CofradiaResponse obtener(@PathVariable Long id) {
        Cofradia cofradia = cofradiaService.obtener(id);
        return CofradiaResponse.from(cofradia);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CofradiaResponse crear(@Valid @RequestBody CofradiaRequest request) {
        Cofradia cofradia = cofradiaService.crear(request);
        return CofradiaResponse.from(cofradia);
    }

    @PutMapping("/{id}")
    public CofradiaResponse actualizar(@PathVariable Long id, @Valid @RequestBody CofradiaRequest request) {
        Cofradia cofradia = cofradiaService.actualizar(id, request);
        return CofradiaResponse.from(cofradia);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cofradiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/codigos-acceso")
    public List<CodigoAccesoResponse> listarCodigosAcceso(@PathVariable Long id) {
        return codigoAccesoService.listarDeCofradia(id).stream()
                .map(CodigoAccesoResponse::from)
                .toList();
    }

    @PostMapping("/{id}/codigos-acceso")
    @ResponseStatus(HttpStatus.CREATED)
    public CodigoAccesoResponse emitirCodigoAcceso(@PathVariable Long id) {
        CodigoAcceso codigoAcceso = codigoAccesoService.emitir(new CodigoAccesoRequest(id));
        return CodigoAccesoResponse.from(codigoAcceso);
    }
}
