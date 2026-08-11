package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AdministradorRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.repository.AdministradorRepository;
import com.semanasanta.backend.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdministradorService {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;

    public AdministradorService(AdministradorRepository administradorRepository, PasswordEncoder passwordEncoder) {
        this.administradorRepository = administradorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Administrador obtener(Long id) {
        return administradorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el administrador con id " + id));
    }

    // TODO(bootstrap): si se exige exigirAdministrador() aquí, el primer
    // Administrador del sistema no se podría crear nunca (nadie autenticado
    // como ADMIN existe todavía). Necesita una vía aparte para el primero
    // (seed manual en la base de datos, o un endpoint de un solo uso protegido
    // por otro secreto) antes de poder cerrar este hueco.
    public Administrador crear(AdministradorRequest request) {
        String passwordHash = passwordEncoder.encode(request.password());
        Administrador administrador = new Administrador(request.email(), passwordHash);
        return administradorRepository.save(administrador);
    }

    public void eliminar(Long id) {
        Administrador administrador = obtener(id);
        administradorRepository.delete(administrador);
    }

    // Compartido entre Services (CiudadService, JuntaCofradiasService,
    // MiembroJuntaCofradiaService...): Administrador es un rol global, así
    // que aquí no hace falta comparar nada, solo el rol. Lanza 403 si no.
    public void exigirAdministrador() {
        if (!"ADMIN".equals(SecurityUtils.usuarioActual().rol())) {
            throw new AccesoDenegadoException("Esta operación solo puede realizarla un Administrador");
        }
    }
}
