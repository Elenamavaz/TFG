package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.JuntaCofradiasRequest;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.repository.JuntaCofradiasRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JuntaCofradiasService {

    private final JuntaCofradiasRepository juntaCofradiasRepository;
    private final CiudadService ciudadService;
    private final AdministradorService administradorService;

    public JuntaCofradiasService(JuntaCofradiasRepository juntaCofradiasRepository, CiudadService ciudadService,
                                  AdministradorService administradorService) {
        this.juntaCofradiasRepository = juntaCofradiasRepository;
        this.ciudadService = ciudadService;
        this.administradorService = administradorService;
    }

    public List<JuntaCofradias> listar() {
        return juntaCofradiasRepository.findAll();
    }

    public JuntaCofradias obtener(Long id) {
        return juntaCofradiasRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la Junta de Cofradías con id " + id));
    }

    // Dar de alta/editar/dar de baja una Junta de Cofradías es cosa del
    // Administrador (Apéndice B: "Dar de alta/Editar/Dar de baja Junta de
    // Cofradías" son casos de uso de ese actor, igual que con Ciudad).
    public JuntaCofradias crear(JuntaCofradiasRequest request) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        if (juntaCofradiasRepository.existsByCiudadId(ciudad.getId())) {
            throw new RecursoDuplicadoException("La ciudad con id " + ciudad.getId() + " ya tiene una Junta de Cofradías");
        }
        JuntaCofradias junta = new JuntaCofradias(request.nombre(), request.email(), request.telefono(), ciudad);
        return juntaCofradiasRepository.save(junta);
    }

    public JuntaCofradias actualizar(Long id, JuntaCofradiasRequest request) {
        administradorService.exigirAdministrador();
        JuntaCofradias junta = obtener(id);

        if (!junta.getCiudad().getId().equals(request.ciudadId())) {
            Ciudad nuevaCiudad = ciudadService.obtener(request.ciudadId());
            if (juntaCofradiasRepository.existsByCiudadId(nuevaCiudad.getId())) {
                throw new RecursoDuplicadoException(
                        "La ciudad con id " + nuevaCiudad.getId() + " ya tiene una Junta de Cofradías");
            }
            junta.setCiudad(nuevaCiudad);
        }

        junta.setNombre(request.nombre());
        junta.setEmail(request.email());
        junta.setTelefono(request.telefono());
        return juntaCofradiasRepository.save(junta);
    }

    public void eliminar(Long id) {
        administradorService.exigirAdministrador();
        JuntaCofradias junta = obtener(id);
        juntaCofradiasRepository.delete(junta);
    }
}
