package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AdministradorBootstrapRequest;
import com.semanasanta.backend.dto.AdministradorRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.repository.AdministradorRepository;
import com.semanasanta.backend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdministradorService {

    private final AdministradorRepository administradorRepository;
    private final PasswordEncoder passwordEncoder;
    private final String bootstrapSecret;

    public AdministradorService(AdministradorRepository administradorRepository, PasswordEncoder passwordEncoder,
                                 @Value("${admin.bootstrap-secret}") String bootstrapSecret) {
        this.administradorRepository = administradorRepository;
        this.passwordEncoder = passwordEncoder;
        this.bootstrapSecret = bootstrapSecret;
    }

    public Administrador obtener(Long id) {
        return administradorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el administrador con id " + id));
    }

    // Cierra el hueco de escalada de privilegios que había hasta ahora: como
    // SecurityConfig solo exige "estar autenticado" (no un rol concreto) para
    // cualquier escritura, CUALQUIER usuario autenticado -una Junta, incluso
    // un Cofrade con solo un código de acceso- podía llamar a este endpoint y
    // crearse un Administrador. Ver crearBootstrap para el primero, que por
    // definición no puede pasar por aquí (nadie autenticado como ADMIN existe
    // todavía).
    public Administrador crear(AdministradorRequest request) {
        exigirAdministrador();
        String passwordHash = passwordEncoder.encode(request.password());
        Administrador administrador = new Administrador(request.email(), passwordHash);
        return administradorRepository.save(administrador);
    }

    // Crea el PRIMER Administrador del sistema, cuando aún no hay ninguno con
    // quien autenticarse para pasar por crear() -este método es la única
    // puerta abierta a un llamante sin JWT (ver el permitAll específico en
    // SecurityConfig), así que se protege con dos comprobaciones en vez de
    // una: el secreto de despliegue (prueba de acceso al servidor, no de ser
    // un usuario concreto) Y que no exista ya ningún Administrador -pasado el
    // primero, esta vía se autodesactiva pase lo que pase con el secreto.
    public Administrador crearBootstrap(AdministradorBootstrapRequest request) {
        if (!bootstrapSecret.equals(request.secreto())) {
            throw new CredencialesInvalidasException("Secreto de bootstrap incorrecto");
        }
        if (administradorRepository.count() > 0) {
            throw new RecursoDuplicadoException(
                    "Ya existe al menos un Administrador; el bootstrap solo funciona para crear el primero");
        }
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
