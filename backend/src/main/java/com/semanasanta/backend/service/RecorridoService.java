package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.RecorridoRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.repository.RecorridoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecorridoService {

    private final RecorridoRepository recorridoRepository;

    public RecorridoService(RecorridoRepository recorridoRepository) {
        this.recorridoRepository = recorridoRepository;
    }

    public List<Recorrido> listar() {
        return recorridoRepository.findAll();
    }

    public Recorrido obtener(Long id) {
        return recorridoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el recorrido con id " + id));
    }

    public Recorrido crear(RecorridoRequest request) {
        Recorrido recorrido = new Recorrido(request.distanciaTotal(), request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    public Recorrido actualizar(Long id, RecorridoRequest request) {
        Recorrido recorrido = obtener(id);
        recorrido.setDistanciaTotal(request.distanciaTotal());
        recorrido.setTiempoEstimado(request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    public void eliminar(Long id) {
        Recorrido recorrido = obtener(id);
        recorridoRepository.delete(recorrido);
    }
}
