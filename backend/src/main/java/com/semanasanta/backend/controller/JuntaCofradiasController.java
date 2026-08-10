package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.JuntaCofradiasRequest;
import com.semanasanta.backend.dto.JuntaCofradiasResponse;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.service.JuntaCofradiasService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/juntas-cofradias")
public class JuntaCofradiasController {

    private final JuntaCofradiasService juntaCofradiasService;

    public JuntaCofradiasController(JuntaCofradiasService juntaCofradiasService) {
        this.juntaCofradiasService = juntaCofradiasService;
    }

    @GetMapping
    public List<JuntaCofradiasResponse> listar() {
        return juntaCofradiasService.listar().stream()
                .map(JuntaCofradiasResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public JuntaCofradiasResponse obtener(@PathVariable Long id) {
        JuntaCofradias junta = juntaCofradiasService.obtener(id);
        return JuntaCofradiasResponse.from(junta);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public JuntaCofradiasResponse crear(@Valid @RequestBody JuntaCofradiasRequest request) {
        JuntaCofradias junta = juntaCofradiasService.crear(request);
        return JuntaCofradiasResponse.from(junta);
    }

    @PutMapping("/{id}")
    public JuntaCofradiasResponse actualizar(@PathVariable Long id, @Valid @RequestBody JuntaCofradiasRequest request) {
        JuntaCofradias junta = juntaCofradiasService.actualizar(id, request);
        return JuntaCofradiasResponse.from(junta);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        juntaCofradiasService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
