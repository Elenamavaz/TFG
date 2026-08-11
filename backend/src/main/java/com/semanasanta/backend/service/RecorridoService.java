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
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public RecorridoService(RecorridoRepository recorridoRepository, MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.recorridoRepository = recorridoRepository;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public List<Recorrido> listar() {
        return recorridoRepository.findAll();
    }

    public Recorrido obtener(Long id) {
        return recorridoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el recorrido con id " + id));
    }

    // Recorrido no tiene dueño único (se reutiliza entre procesiones, incluso
    // de ciudades distintas): basta con ser cualquier Junta, sin comparar
    // ciudad -igual que Administrador con Ciudad.
    public Recorrido crear(RecorridoRequest request) {
        miembroJuntaCofradiaService.exigirJunta();
        Recorrido recorrido = new Recorrido(request.distanciaTotal(), request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    public Recorrido actualizar(Long id, RecorridoRequest request) {
        miembroJuntaCofradiaService.exigirJunta();
        Recorrido recorrido = obtener(id);
        recorrido.setDistanciaTotal(request.distanciaTotal());
        recorrido.setTiempoEstimado(request.tiempoEstimado());
        return recorridoRepository.save(recorrido);
    }

    public void eliminar(Long id) {
        miembroJuntaCofradiaService.exigirJunta();
        Recorrido recorrido = obtener(id);
        recorridoRepository.delete(recorrido);
    }
}
