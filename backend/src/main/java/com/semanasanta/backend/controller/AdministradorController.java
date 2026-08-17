package com.semanasanta.backend.controller;

import com.semanasanta.backend.dto.AdministradorBootstrapRequest;
import com.semanasanta.backend.dto.AdministradorPerfilRequest;
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

    // Sin JWT a propósito (ver el permitAll específico en SecurityConfig y
    // los comentarios de AdministradorService.crearBootstrap): solo sirve
    // para el primer Administrador, protegido por ADMIN_BOOTSTRAP_SECRET en
    // vez de por rol.
    @PostMapping("/bootstrap")
    @ResponseStatus(HttpStatus.CREATED)
    public AdministradorResponse crearBootstrap(@Valid @RequestBody AdministradorBootstrapRequest request) {
        Administrador administrador = administradorService.crearBootstrap(request);
        return AdministradorResponse.from(administrador);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        administradorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // Sin {id}: siempre es el propio Administrador autenticado (ver
    // AdministradorService.actualizarPerfilPropio). No colisiona con
    // PUT /administradores/{id} porque ese endpoint no existe -dar de alta/
    // baja Administradores es cosa de otro Administrador, pero editar el
    // perfil (nombre/teléfono/contraseña) es cosa de uno mismo.
    @PutMapping("/perfil")
    public AdministradorResponse actualizarPerfilPropio(@Valid @RequestBody AdministradorPerfilRequest request) {
        Administrador administrador = administradorService.actualizarPerfilPropio(request);
        return AdministradorResponse.from(administrador);
    }
}
