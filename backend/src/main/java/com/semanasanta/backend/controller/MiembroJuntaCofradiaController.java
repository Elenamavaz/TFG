package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.MiembroJuntaCofradiaRequest;
import com.semanasanta.backend.dto.MiembroJuntaCofradiaResponse;
import com.semanasanta.backend.model.MiembroJuntaCofradia;
import com.semanasanta.backend.service.MiembroJuntaCofradiaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/miembros-junta")
public class MiembroJuntaCofradiaController {

    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public MiembroJuntaCofradiaController(MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    @GetMapping("/{id}")
    public MiembroJuntaCofradiaResponse obtener(@PathVariable Long id) {
        MiembroJuntaCofradia miembro = miembroJuntaCofradiaService.obtener(id);
        return MiembroJuntaCofradiaResponse.from(miembro);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MiembroJuntaCofradiaResponse crear(@Valid @RequestBody MiembroJuntaCofradiaRequest request) {
        MiembroJuntaCofradia miembro = miembroJuntaCofradiaService.crear(request);
        return MiembroJuntaCofradiaResponse.from(miembro);
    }

    @PutMapping("/{id}")
    public MiembroJuntaCofradiaResponse actualizar(@PathVariable Long id, @Valid @RequestBody MiembroJuntaCofradiaRequest request) {
        MiembroJuntaCofradia miembro = miembroJuntaCofradiaService.actualizar(id, request);
        return MiembroJuntaCofradiaResponse.from(miembro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        miembroJuntaCofradiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // Autoservicio del propio miembro desactivado, ver
    // MiembroJuntaCofradiaService.solicitarReactivacion.
    @PostMapping("/solicitar-reactivacion")
    public ResponseEntity<Void> solicitarReactivacion() {
        miembroJuntaCofradiaService.solicitarReactivacion();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/solicitudes-reactivacion")
    public List<MiembroJuntaCofradiaResponse> solicitudesReactivacion() {
        return miembroJuntaCofradiaService.listarSolicitudesReactivacion().stream()
                .map(MiembroJuntaCofradiaResponse::from)
                .toList();
    }

    @PostMapping("/{id}/aceptar-reactivacion")
    public MiembroJuntaCofradiaResponse aceptarReactivacion(@PathVariable Long id) {
        return MiembroJuntaCofradiaResponse.from(miembroJuntaCofradiaService.aceptarReactivacion(id));
    }

    @PostMapping("/{id}/rechazar-reactivacion")
    public MiembroJuntaCofradiaResponse rechazarReactivacion(@PathVariable Long id) {
        return MiembroJuntaCofradiaResponse.from(miembroJuntaCofradiaService.rechazarReactivacion(id));
    }
}
