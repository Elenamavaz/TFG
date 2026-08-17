package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.MiembroJuntaCofradiaRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.model.MiembroJuntaCofradia;
import com.semanasanta.backend.repository.MiembroJuntaCofradiaRepository;
import com.semanasanta.backend.security.SecurityUtils;
import com.semanasanta.backend.security.UsuarioPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class MiembroJuntaCofradiaService {

    private final MiembroJuntaCofradiaRepository miembroJuntaCofradiaRepository;
    private final JuntaCofradiasService juntaCofradiasService;
    private final AdministradorService administradorService;
    private final PasswordEncoder passwordEncoder;
    private final CorreoService correoService;

    public MiembroJuntaCofradiaService(MiembroJuntaCofradiaRepository miembroJuntaCofradiaRepository,
                                        JuntaCofradiasService juntaCofradiasService,
                                        AdministradorService administradorService, PasswordEncoder passwordEncoder,
                                        CorreoService correoService) {
        this.miembroJuntaCofradiaRepository = miembroJuntaCofradiaRepository;
        this.juntaCofradiasService = juntaCofradiasService;
        this.administradorService = administradorService;
        this.passwordEncoder = passwordEncoder;
        this.correoService = correoService;
    }

    public MiembroJuntaCofradia obtener(Long id) {
        return miembroJuntaCofradiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el miembro de Junta con id " + id));
    }

    public List<MiembroJuntaCofradia> listarDeJunta(Long juntaCofradiasId) {
        juntaCofradiasService.obtener(juntaCofradiasId); // 404 si la Junta no existe
        return miembroJuntaCofradiaRepository.findByJuntaCofradiasId(juntaCofradiasId);
    }

    // Dar de alta/baja miembros de una Junta es cosa del Administrador (te lo
    // dijiste tú misma: "el administrador... tiene permisos de hacer cosas de
    // las ciudades o de los miembros de la junta, añadir/eliminar/actualizar
    // uno existente"), no de la propia Junta.
    //
    // @Transactional: el correo con la contraseña (ver CorreoService) es la
    // única vía por la que el miembro llega a conocerla -si el envío falla,
    // no queremos dejar creada una cuenta cuya contraseña nadie ha visto
    // nunca; mejor deshacer el alta entero y que el Administrador reintente.
    @Transactional
    public MiembroJuntaCofradia crear(MiembroJuntaCofradiaRequest request) {
        administradorService.exigirAdministrador();
        JuntaCofradias junta = juntaCofradiasService.obtener(request.juntaCofradiasId()); // 404 si no existe
        String passwordGenerada = generarPassword();
        String passwordHash = passwordEncoder.encode(passwordGenerada);
        MiembroJuntaCofradia miembro = new MiembroJuntaCofradia(request.nombre(), request.email(), passwordHash, junta);
        miembro = miembroJuntaCofradiaRepository.save(miembro);
        correoService.enviarBienvenidaMiembroJunta(request.nombre(), request.email(), passwordGenerada);
        return miembro;
    }

    // 12 caracteres hexadecimales de un UUID aleatorio (mismo generador que
    // CodigoAccesoService.emitir): entropía de sobra para una contraseña
    // provisional que el miembro cambiará en cuanto inicie sesión.
    private String generarPassword() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    // Solo nombre/activo: el email no tiene setter en Usuario (no se puede
    // reasignar) y reasignar juntaCofradiasId aquí abriría un caso raro -mover
    // un miembro entre Juntas no está pedido, si hace falta se añade aparte.
    // "activo" es lo importante: es como el Administrador reactiva a un
    // miembro desactivado, ver exigirJunta().
    public MiembroJuntaCofradia actualizar(Long id, MiembroJuntaCofradiaRequest request) {
        administradorService.exigirAdministrador();
        MiembroJuntaCofradia miembro = obtener(id);
        miembro.setNombre(request.nombre());
        miembro.setActivo(request.activo());
        // Reactivar a mano desde aquí también resuelve cualquier solicitud
        // que hubiera pendiente -si no, se quedaría "pidiendo reactivación"
        // aun ya reactivado.
        if (request.activo()) {
            miembro.setSolicitudReactivacionPendiente(false);
        }
        return miembroJuntaCofradiaRepository.save(miembro);
    }

    // Autoservicio del propio miembro desactivado (ver CuentaDesactivadaScreen
    // del frontend) -NO pasa por exigirJunta() a propósito: ese método
    // rechaza precisamente a quien está desactivado, y es justo quien
    // necesita poder llamar a esto.
    public void solicitarReactivacion() {
        UsuarioPrincipal actual = SecurityUtils.usuarioActual();
        if (!"JUNTA".equals(actual.rol())) {
            throw new AccesoDenegadoException("Esta operación solo puede realizarla un miembro de Junta");
        }
        MiembroJuntaCofradia miembro = obtener(actual.id());
        if (miembro.isActivo()) {
            throw new IllegalStateException("Tu cuenta ya está activa");
        }
        miembro.setSolicitudReactivacionPendiente(true);
        miembroJuntaCofradiaRepository.save(miembro);
    }

    public List<MiembroJuntaCofradia> listarSolicitudesReactivacion() {
        administradorService.exigirAdministrador();
        return miembroJuntaCofradiaRepository.findBySolicitudReactivacionPendienteTrue();
    }

    public MiembroJuntaCofradia aceptarReactivacion(Long id) {
        administradorService.exigirAdministrador();
        MiembroJuntaCofradia miembro = obtener(id);
        miembro.setActivo(true);
        miembro.setSolicitudReactivacionPendiente(false);
        return miembroJuntaCofradiaRepository.save(miembro);
    }

    // Rechazar NO borra la solicitud sin más rastro: el miembro sigue
    // desactivado, solo se limpia la marca de "pendiente" para que pueda
    // volver a pedirlo más adelante si hace falta.
    public MiembroJuntaCofradia rechazarReactivacion(Long id) {
        administradorService.exigirAdministrador();
        MiembroJuntaCofradia miembro = obtener(id);
        miembro.setSolicitudReactivacionPendiente(false);
        return miembroJuntaCofradiaRepository.save(miembro);
    }

    public void eliminar(Long id) {
        administradorService.exigirAdministrador();
        MiembroJuntaCofradia miembro = obtener(id);
        miembroJuntaCofradiaRepository.delete(miembro);
    }

    // Para entidades compartidas sin dueño único (Recorrido, PuntoRuta,
    // Ubicacion...): basta con ser CUALQUIER Junta, no hay ciudad concreta
    // que comparar -la misma Ubicacion la puede reutilizar cualquier evento
    // de cualquier ciudad, por ejemplo. Un miembro desactivado SÍ puede
    // iniciar sesión (ve un aviso pidiendo la reactivación, ver AuthResponse
    // y LoginScreen del frontend), pero no puede escribir nada -de ahí el
    // chequeo de "activo" aquí, no en AuthService.login: es la comprobación
    // que protege TODAS las escrituras de Junta, ya use la pantalla o llame
    // a la API directamente.
    public void exigirJunta() {
        UsuarioPrincipal actual = SecurityUtils.usuarioActual();
        if (!"JUNTA".equals(actual.rol())) {
            throw new AccesoDenegadoException("Esta operación solo puede realizarla una Junta de Cofradías");
        }
        if (!obtener(actual.id()).isActivo()) {
            throw new AccesoDenegadoException("Tu cuenta de Junta está desactivada; solicita al Administrador que la reactive");
        }
    }

    // Compartido entre Services (CofradiaService, CodigoAccesoService...):
    // comprueba que quien hace la petición es un miembro de la Junta que
    // gestiona ESA ciudad, no cualquier Junta. Lanza 403 si no.
    public void exigirJuntaDeLaCiudad(Long ciudadId) {
        exigirJunta();
        UsuarioPrincipal actual = SecurityUtils.usuarioActual();
        MiembroJuntaCofradia miembro = obtener(actual.id());
        if (!miembro.getJuntaCofradias().getCiudad().getId().equals(ciudadId)) {
            throw new AccesoDenegadoException("Esta Junta no gestiona la ciudad indicada");
        }
    }
}
