package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.CodigoAccesoResponse;
import com.semanasanta.backend.model.CodigoAcceso;
import com.semanasanta.backend.service.CodigoAccesoService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/codigos-acceso")
public class CodigoAccesoController {

    private final CodigoAccesoService codigoAccesoService;

    public CodigoAccesoController(CodigoAccesoService codigoAccesoService) {
        this.codigoAccesoService = codigoAccesoService;
    }

    @GetMapping("/{id}")
    public CodigoAccesoResponse obtener(@PathVariable Long id) {
        CodigoAcceso codigoAcceso = codigoAccesoService.obtener(id);
        return CodigoAccesoResponse.from(codigoAcceso);
    }

    // No hay DELETE: un código emitido no se borra, se revoca (conserva el
    // historial de quién lo canjeó/cuándo se invalidó).
    @PostMapping("/{id}/revocar")
    public CodigoAccesoResponse revocar(@PathVariable Long id) {
        CodigoAcceso codigoAcceso = codigoAccesoService.revocar(id);
        return CodigoAccesoResponse.from(codigoAcceso);
    }
}
