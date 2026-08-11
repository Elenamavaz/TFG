package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.JuntaCofradiasRequest;
import com.semanasanta.backend.dto.JuntaCofradiasResponse;
import com.semanasanta.backend.dto.MiembroJuntaCofradiaResponse;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.service.JuntaCofradiasService;
import com.semanasanta.backend.service.MiembroJuntaCofradiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/juntas-cofradias")
public class JuntaCofradiasController {

    private final JuntaCofradiasService juntaCofradiasService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public JuntaCofradiasController(JuntaCofradiasService juntaCofradiasService,
                                     MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.juntaCofradiasService = juntaCofradiasService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
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

    @GetMapping("/{id}/miembros")
    public List<MiembroJuntaCofradiaResponse> listarMiembros(@PathVariable Long id) {
        return miembroJuntaCofradiaService.listarDeJunta(id).stream()
                .map(MiembroJuntaCofradiaResponse::from)
                .toList();
    }
}
