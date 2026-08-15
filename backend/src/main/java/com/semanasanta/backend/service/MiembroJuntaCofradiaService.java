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

    public void eliminar(Long id) {
        administradorService.exigirAdministrador();
        MiembroJuntaCofradia miembro = obtener(id);
        miembroJuntaCofradiaRepository.delete(miembro);
    }

    // Para entidades compartidas sin dueño único (Recorrido, PuntoRuta,
    // Ubicacion...): basta con ser CUALQUIER Junta, no hay ciudad concreta
    // que comparar -la misma Ubicacion la puede reutilizar cualquier evento
    // de cualquier ciudad, por ejemplo.
    public void exigirJunta() {
        if (!"JUNTA".equals(SecurityUtils.usuarioActual().rol())) {
            throw new AccesoDenegadoException("Esta operación solo puede realizarla una Junta de Cofradías");
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
