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

import java.util.List;

@Service
public class MiembroJuntaCofradiaService {

    private final MiembroJuntaCofradiaRepository miembroJuntaCofradiaRepository;
    private final JuntaCofradiasService juntaCofradiasService;
    private final AdministradorService administradorService;
    private final PasswordEncoder passwordEncoder;

    public MiembroJuntaCofradiaService(MiembroJuntaCofradiaRepository miembroJuntaCofradiaRepository,
                                        JuntaCofradiasService juntaCofradiasService,
                                        AdministradorService administradorService, PasswordEncoder passwordEncoder) {
        this.miembroJuntaCofradiaRepository = miembroJuntaCofradiaRepository;
        this.juntaCofradiasService = juntaCofradiasService;
        this.administradorService = administradorService;
        this.passwordEncoder = passwordEncoder;
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
    public MiembroJuntaCofradia crear(MiembroJuntaCofradiaRequest request) {
        administradorService.exigirAdministrador();
        JuntaCofradias junta = juntaCofradiasService.obtener(request.juntaCofradiasId()); // 404 si no existe
        String passwordHash = passwordEncoder.encode(request.password());
        MiembroJuntaCofradia miembro = new MiembroJuntaCofradia(request.email(), passwordHash, junta);
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
