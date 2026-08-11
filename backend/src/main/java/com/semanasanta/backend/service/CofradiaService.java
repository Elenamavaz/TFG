package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CofradiaRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.repository.CofradiaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CofradiaService {

    private final CofradiaRepository cofradiaRepository;
    private final CiudadService ciudadService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public CofradiaService(CofradiaRepository cofradiaRepository, CiudadService ciudadService,
                            MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.cofradiaRepository = cofradiaRepository;
        this.ciudadService = ciudadService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public List<Cofradia> listar() {
        return cofradiaRepository.findAll();
    }

    public Cofradia obtener(Long id) {
        return cofradiaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la cofradía con id " + id));
    }

    public Cofradia crear(CofradiaRequest request) {
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudad.getId());
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
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(cofradia.getCiudad().getId()); // la ciudad ACTUAL, no la nueva del request
        if (!request.ciudadId().equals(cofradia.getCiudad().getId())) {
            throw new AccesoDenegadoException("Una cofradía no puede moverse a otra ciudad");
        }
        cofradia.setNombre(request.nombre());
        cofradia.setHistoria(request.historia());
        cofradia.setWeb(request.web());
        // fechaCreacion no se toca: no tiene setter en la entidad a propósito.
        return cofradiaRepository.save(cofradia);
    }

    public void eliminar(Long id) {
        Cofradia cofradia = obtener(id);
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(cofradia.getCiudad().getId());
        cofradiaRepository.delete(cofradia);
    }

    // Reutilizado por EventoService/ProcesionService: resuelve las cofradías
    // participantes de un evento/procesión, comprueba que TODAS son de la
    // misma ciudad (un evento no puede mezclar cofradías de ciudades
    // distintas) y que quien lo pide es la Junta de esa ciudad.
    public Set<Cofradia> resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(List<Long> cofradiaIds) {
        Set<Cofradia> cofradias = new LinkedHashSet<>();
        for (Long cofradiaId : cofradiaIds) {
            cofradias.add(obtener(cofradiaId)); // 404 si alguna cofradía no existe
        }
        Set<Long> ciudadIds = cofradias.stream().map(c -> c.getCiudad().getId()).collect(Collectors.toSet());
        if (ciudadIds.size() > 1) {
            throw new AccesoDenegadoException("Todas las cofradías de un evento deben pertenecer a la misma ciudad");
        }
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadIds.iterator().next());
        return cofradias;
    }
}
