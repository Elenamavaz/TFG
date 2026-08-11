package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PuntoRutaRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import org.springframework.stereotype.Service;

@Service
public class PuntoRutaService {

    private final PuntoRutaRepository puntoRutaRepository;
    private final UbicacionService ubicacionService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public PuntoRutaService(PuntoRutaRepository puntoRutaRepository, UbicacionService ubicacionService,
                             MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.puntoRutaRepository = puntoRutaRepository;
        this.ubicacionService = ubicacionService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public PuntoRuta obtener(Long id) {
        return puntoRutaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el punto de ruta con id " + id));
    }

    // PuntoRuta no tiene dueño único (se reutiliza entre recorridos): basta
    // con ser cualquier Junta.
    public PuntoRuta crear(PuntoRutaRequest request) {
        miembroJuntaCofradiaService.exigirJunta();
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId()); // 404 si la ubicación no existe
        PuntoRuta puntoRuta = new PuntoRuta(ubicacion);
        return puntoRutaRepository.save(puntoRuta);
    }

    public PuntoRuta actualizar(Long id, PuntoRutaRequest request) {
        miembroJuntaCofradiaService.exigirJunta();
        PuntoRuta puntoRuta = obtener(id);
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        puntoRuta.setUbicacion(ubicacion);
        return puntoRutaRepository.save(puntoRuta);
    }

    public void eliminar(Long id) {
        miembroJuntaCofradiaService.exigirJunta();
        PuntoRuta puntoRuta = obtener(id);
        puntoRutaRepository.delete(puntoRuta);
    }
}
