package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AuthResponse;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.CredencialesInvalidasException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.*;
import com.semanasanta.backend.repository.CodigoAccesoRepository;
import com.semanasanta.backend.repository.UsuarioRepository;
import com.semanasanta.backend.security.JwtService;
import com.semanasanta.backend.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final CodigoAccesoRepository codigoAccesoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, CodigoAccesoRepository codigoAccesoRepository,
                        PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.codigoAccesoRepository = codigoAccesoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Para Administrador y MiembroJuntaCofradia (email+contraseña).
    public AuthResponse login(String email, String password) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new CredencialesInvalidasException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(password, usuario.getPasswordHash())) {
            throw new CredencialesInvalidasException("Email o contraseña incorrectos");
        }

        String rol = rolDe(usuario);
        // Un miembro de Junta desactivado SÍ puede iniciar sesión (ver
        // AuthResponse): es el frontend quien, con este campo, le lleva a un
        // aviso de "cuenta desactivada" en vez de al panel. El rechazo de
        // verdad está en las escrituras, ver MiembroJuntaCofradiaService.exigirJunta.
        boolean activo = !(usuario instanceof MiembroJuntaCofradia miembro) || miembro.isActivo();
        String token = jwtService.generarToken(usuario.getId(), rol);
        return new AuthResponse(token, rol, usuario.getId(), activo);
    }

    // Decisión del 2026-08-11: sin contraseña Y sin crear ningún usuario. El
    // código de acceso es la credencial en sí; validarlo da un JWT con rol
    // COFRADE cuyo "id" es la cofradía (no un usuarioId, no existe tal cosa),
    // sin dejar ningún registro de quién lo canjeó. El código no "se gasta":
    // sigue sirviendo para volver a entrar mientras no esté revocado.
    public AuthResponse loginConCodigoAcceso(String codigo) {
        CodigoAcceso codigoAcceso = codigoAccesoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new CredencialesInvalidasException("Código de acceso no válido"));

        if (codigoAcceso.getEstado() == EstadoCodigo.REVOCADO) {
            throw new CredencialesInvalidasException("Código de acceso revocado");
        }
        if (codigoAcceso.getEstado() == EstadoCodigo.EMITIDO) {
            codigoAcceso.setEstado(EstadoCodigo.VALIDADO); // marca que ya se ha usado al menos una vez
            codigoAccesoRepository.save(codigoAcceso);
        }

        Long cofradiaId = codigoAcceso.getCofradia().getId();
        String token = jwtService.generarToken(cofradiaId, "COFRADE");
        return new AuthResponse(token, "COFRADE", cofradiaId, true);
    }

    // Para Administrador y MiembroJuntaCofradia -el Cofrade no tiene
    // contraseña que cambiar, entra con código de acceso. Pensado sobre todo
    // para el Miembro de Junta recién creado: la contraseña que le llega por
    // correo (ver CorreoService) es provisional, esto es lo que la reemplaza.
    public void cambiarPassword(String passwordActual, String passwordNueva) {
        Long usuarioId = SecurityUtils.usuarioActual().id();
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el usuario con id " + usuarioId));

        if (!passwordEncoder.matches(passwordActual, usuario.getPasswordHash())) {
            throw new CredencialesInvalidasException("La contraseña actual no es correcta");
        }
        // Mismo criterio que el resto de escrituras de Junta (ver
        // MiembroJuntaCofradiaService.exigirJunta): desactivado no puede
        // cambiar nada, ni siquiera su propia contraseña.
        if (usuario instanceof MiembroJuntaCofradia miembro && !miembro.isActivo()) {
            throw new AccesoDenegadoException("Tu cuenta de Junta está desactivada; solicita al Administrador que la reactive");
        }

        usuario.setPasswordHash(passwordEncoder.encode(passwordNueva));
        usuarioRepository.save(usuario);
    }

    private String rolDe(Usuario usuario) {
        if (usuario instanceof Administrador) {
            return "ADMIN";
        }
        if (usuario instanceof MiembroJuntaCofradia) {
            return "JUNTA";
        }
        // Salvaguarda explícita: con solo estos dos subtipos de Usuario, esta
        // rama no debería alcanzarse nunca.
        throw new CredencialesInvalidasException("Este tipo de usuario no puede iniciar sesión con email y contraseña");
    }
}
