package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.UbicacionRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.UbicacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UbicacionService {

    private final UbicacionRepository ubicacionRepository;

    public UbicacionService(UbicacionRepository ubicacionRepository) {
        this.ubicacionRepository = ubicacionRepository;
    }

    public List<Ubicacion> listar() {
        return ubicacionRepository.findAll();
    }

    public Ubicacion obtener(Long id) {
        return ubicacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la ubicación con id " + id));
    }

    public Ubicacion crear(UbicacionRequest request) {
        Ubicacion ubicacion = new Ubicacion(request.latitud(), request.longitud(), request.direccion());
        return ubicacionRepository.save(ubicacion);
    }

    public Ubicacion actualizar(Long id, UbicacionRequest request) {
        Ubicacion ubicacion = obtener(id);
        ubicacion.setLatitud(request.latitud());
        ubicacion.setLongitud(request.longitud());
        ubicacion.setDireccion(request.direccion());
        return ubicacionRepository.save(ubicacion);
    }

    public void eliminar(Long id) {
        Ubicacion ubicacion = obtener(id);
        ubicacionRepository.delete(ubicacion);
    }
}
