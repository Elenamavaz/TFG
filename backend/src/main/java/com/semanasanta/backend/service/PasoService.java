package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PasoRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Paso;
import com.semanasanta.backend.repository.PasoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PasoService {

    private final PasoRepository pasoRepository;
    private final CofradiaService cofradiaService;

    public PasoService(PasoRepository pasoRepository, CofradiaService cofradiaService) {
        this.pasoRepository = pasoRepository;
        this.cofradiaService = cofradiaService;
    }

    public List<Paso> listar() {
        return pasoRepository.findAll();
    }

    public Paso obtener(Long id) {
        return pasoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el paso con id " + id));
    }

    public Paso crear(PasoRequest request) {
        Cofradia cofradia = cofradiaService.obtener(request.cofradiaId()); // 404 si la cofradía no existe
        Paso paso = new Paso(request.nombre(), request.historia(), request.analisisArtistico(), request.imagen(), cofradia);
        return pasoRepository.save(paso);
    }

    public Paso actualizar(Long id, PasoRequest request) {
        Paso paso = obtener(id);
        Cofradia cofradia = cofradiaService.obtener(request.cofradiaId());
        paso.setNombre(request.nombre());
        paso.setHistoria(request.historia());
        paso.setAnalisisArtistico(request.analisisArtistico());
        paso.setImagen(request.imagen());
        paso.setCofradia(cofradia);
        return pasoRepository.save(paso);
    }

    public void eliminar(Long id) {
        Paso paso = obtener(id);
        pasoRepository.delete(paso);
    }
}
