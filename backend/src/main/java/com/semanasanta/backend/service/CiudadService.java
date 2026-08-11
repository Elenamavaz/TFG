package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CiudadRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CiudadRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CiudadService {

    private final CiudadRepository ciudadRepository;
    private final AdministradorService administradorService;

    public CiudadService(CiudadRepository ciudadRepository, AdministradorService administradorService) {
        this.ciudadRepository = ciudadRepository;
        this.administradorService = administradorService;
    }

    public List<Ciudad> listar() {
        return ciudadRepository.findAll();
    }

    public Ciudad obtener(Long id) {
        return ciudadRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la ciudad con id " + id));
    }

    public Ciudad crear(CiudadRequest request) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = new Ciudad(request.nombre(), request.comunidadAutonoma(), request.descripcion());
        return ciudadRepository.save(ciudad);
    }

    public Ciudad actualizar(Long id, CiudadRequest request) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = obtener(id);
        ciudad.setNombre(request.nombre());
        ciudad.setComunidadAutonoma(request.comunidadAutonoma());
        ciudad.setDescripcion(request.descripcion());
        return ciudadRepository.save(ciudad);
    }

    public void eliminar(Long id) {
        administradorService.exigirAdministrador();
        Ciudad ciudad = obtener(id);
        ciudadRepository.delete(ciudad);
    }
}
