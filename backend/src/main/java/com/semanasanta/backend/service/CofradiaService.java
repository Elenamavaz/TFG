package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CofradiaRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CofradiaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CofradiaService {

    private final CofradiaRepository cofradiaRepository;
    private final CiudadService ciudadService;

    public CofradiaService(CofradiaRepository cofradiaRepository, CiudadService ciudadService) {
        this.cofradiaRepository = cofradiaRepository;
        this.ciudadService = ciudadService;
    }

    public List<Cofradia> listar() {
        return cofradiaRepository.findAll();
    }

    public Cofradia obtener(Long id) {
        return cofradiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la cofradía con id " + id));
    }

    // TODO(auth JWT + usuarios.ciudad_id): crear/actualizar/eliminar deben comprobar
    // aquí que el usuario autenticado es rol=JUNTA y que su ciudad gestionada
    // coincide con `ciudad.getId()`, lanzando 403 si no. Requiere primero que
    // `usuarios` tenga un ciudad_id para el rol JUNTA (no existe en el Apéndice C
    // actual) y el filtro JWT que resuelva "quién soy" en cada petición.
    public Cofradia crear(CofradiaRequest request) {
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        Cofradia cofradia = new Cofradia(
                request.nombre(),
                request.historia(),
                request.web(),
                LocalDateTime.now(), // fecha_creacion la fija el servidor, no el cliente
                ciudad
        );
        return cofradiaRepository.save(cofradia);
    }

    public Cofradia actualizar(Long id, CofradiaRequest request) {
        Cofradia cofradia = obtener(id);
        Ciudad ciudad = ciudadService.obtener(request.ciudadId());
        cofradia.setNombre(request.nombre());
        cofradia.setHistoria(request.historia());
        cofradia.setWeb(request.web());
        cofradia.setCiudad(ciudad);
        // fechaCreacion no se toca: no tiene setter en la entidad a propósito.
        return cofradiaRepository.save(cofradia);
    }

    public void eliminar(Long id) {
        Cofradia cofradia = obtener(id);
        cofradiaRepository.delete(cofradia);
    }
}
