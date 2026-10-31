package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AdministradorBootstrapRequest;
import com.semanasanta.backend.dto.AdministradorPerfilRequest;
import com.semanasanta.backend.dto.AdministradorRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.repository.AdministradorRepository;
import com.semanasanta.backend.repository.UsuarioRepository;
import com.semanasanta.backend.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AdministradorService {

    private final AdministradorRepository administradorRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CorreoService correoService;
    private final String bootstrapSecret;

    public AdministradorService(AdministradorRepository administradorRepository, UsuarioRepository usuarioRepository,
                                 PasswordEncoder passwordEncoder, CorreoService correoService,
                                 @Value("${admin.bootstrap-secret}") String bootstrapSecret) {
        this.administradorRepository = administradorRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.correoService = correoService;
        this.bootstrapSecret = bootstrapSecret;
    }

    public Administrador obtener(Long id) {
        return administradorRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el administrador con id " + id));
    }

    // GET /administradores/{id}: obtener() a secas es para uso interno; desde
    // fuera devuelve email y teléfono, así que solo puede consultarlo otro
    // Administrador (antes era un GET público, como todos).
    public Administrador consultar(Long id) {
        exigirAdministrador();
        return obtener(id);
    }

    // Cierra el hueco de escalada de privilegios que había hasta ahora: como
    // SecurityConfig solo exige "estar autenticado" (no un rol concreto) para
    // cualquier escritura, CUALQUIER usuario autenticado -una Junta, incluso
    // un Cofrade con solo un código de acceso- podía llamar a este endpoint y
    // crearse un Administrador. Ver crearBootstrap para el primero, que por
    // definición no puede pasar por aquí (nadie autenticado como ADMIN existe
    // todavía).
    //
    // Desde el 2026-10-31 (alta desde la app) funciona igual que el alta de
    // un miembro de Junta: la contraseña la genera el sistema y llega por
    // correo, y es provisional. @Transactional por el mismo motivo que
    // MiembroJuntaCofradiaService.crear: si el correo falla, no dejar creada
    // una cuenta cuya contraseña nadie ha visto.
    @Transactional
    public Administrador crear(AdministradorRequest request) {
        exigirAdministrador();
        exigirEmailLibre(request.email());
        String passwordGenerada = generarPassword();
        Administrador administrador = new Administrador(request.email(), passwordEncoder.encode(passwordGenerada));
        administrador.setNombre(request.nombre());
        administrador.setTelefono(request.telefono());
        administrador.setPasswordProvisional(true);
        administrador = administradorRepository.save(administrador);
        correoService.enviarBienvenidaAdministrador(request.nombre(), request.email(), passwordGenerada);
        return administrador;
    }

    // Pantalla "Administradores" del panel (2026-10-31).
    public List<Administrador> listar() {
        exigirAdministrador();
        return administradorRepository.findAll();
    }

    // Mismo funcionamiento que MiembroJuntaCofradiaService.reenviarInvitacion:
    // contraseña provisional nueva (invalida la anterior) y otro correo.
    @Transactional
    public Administrador reenviarInvitacion(Long id) {
        exigirAdministrador();
        Administrador administrador = obtener(id);
        String passwordGenerada = generarPassword();
        administrador.setPasswordHash(passwordEncoder.encode(passwordGenerada));
        administrador.setPasswordProvisional(true);
        administrador = administradorRepository.save(administrador);
        correoService.enviarBienvenidaAdministrador(administrador.getNombre(), administrador.getEmail(), passwordGenerada);
        return administrador;
    }

    // Mismo generador que MiembroJuntaCofradiaService.generarPassword.
    private String generarPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
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
        exigirEmailLibre(request.email());
        String passwordHash = passwordEncoder.encode(request.password());
        Administrador administrador = new Administrador(request.email(), passwordHash);
        return administradorRepository.save(administrador);
    }

    // Faltaba exigirAdministrador(): cualquier usuario autenticado (una Junta,
    // incluso un Cofrade) podía borrar Administradores.
    // Nadie puede eliminarse a sí mismo (2026-10-31): así siempre queda al
    // menos un Administrador -el que borra- y no hace falta volver a pasar
    // por el bootstrap.
    public void eliminar(Long id) {
        exigirAdministrador();
        if (id.equals(SecurityUtils.usuarioActual().id())) {
            throw new AccesoDenegadoException("No puedes eliminar tu propia cuenta de administrador");
        }
        Administrador administrador = obtener(id);
        administradorRepository.delete(administrador);
    }

    // "Editar perfil" (panel de Administrador): SIEMPRE pide la contraseña
    // actual, cambie o no la contraseña -confirma que es él quien edita, no
    // solo que tiene un JWT válido (mismo motivo que AuthService.cambiarPassword).
    // El id sale del propio JWT (SecurityUtils), no de la URL: no hay forma
    // de editar el perfil de OTRO Administrador por aquí, a propósito.
    public Administrador actualizarPerfilPropio(AdministradorPerfilRequest request) {
        exigirAdministrador();
        Administrador administrador = obtener(SecurityUtils.usuarioActual().id());

        if (!passwordEncoder.matches(request.passwordActual(), administrador.getPasswordHash())) {
            throw new CredencialesInvalidasException("La contraseña actual no es correcta");
        }

        administrador.setNombre(request.nombre());
        administrador.setTelefono(request.telefono());
        if (request.passwordNueva() != null && !request.passwordNueva().isBlank()) {
            administrador.setPasswordHash(passwordEncoder.encode(request.passwordNueva()));
        }
        return administradorRepository.save(administrador);
    }

    // Compartido entre Services (CiudadService, JuntaCofradiasService,
    // MiembroJuntaCofradiaService...): Administrador es un rol global, así
    // que aquí no hace falta comparar nada, solo el rol. Lanza 403 si no.
    //
    // Contraseña provisional sin cambiar (2026-10-31): mismo criterio que
    // MiembroJuntaCofradiaService.exigirJunta -la app le lleva a cambiarla,
    // pero se exige aquí para que no baste con llamar a la API. Cambiarla va
    // por AuthService.cambiarPassword, que no pasa por aquí.
    public void exigirAdministrador() {
        if (!"ADMIN".equals(SecurityUtils.usuarioActual().rol())) {
            throw new AccesoDenegadoException("Esta operación solo puede realizarla un Administrador");
        }
        boolean provisional = administradorRepository.findById(SecurityUtils.usuarioActual().id())
                .map(Administrador::isPasswordProvisional)
                .orElse(false);
        if (provisional) {
            throw new AccesoDenegadoException("Debes cambiar tu contraseña provisional antes de hacer cambios");
        }
    }

    // Compartido con MiembroJuntaCofradiaService: el email es UNIQUE en
    // usuarios para los dos subtipos, así que se comprueba contra todos.
    public void exigirEmailLibre(String email) {
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new RecursoDuplicadoException("Ya existe un usuario registrado con el email " + email);
        }
    }
}
