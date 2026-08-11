package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PuntoRutaRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PuntoRutaService {

    private final PuntoRutaRepository puntoRutaRepository;
    private final RecorridoService recorridoService;
    private final UbicacionService ubicacionService;

    public PuntoRutaService(PuntoRutaRepository puntoRutaRepository, RecorridoService recorridoService,
                             UbicacionService ubicacionService) {
        this.puntoRutaRepository = puntoRutaRepository;
        this.recorridoService = recorridoService;
        this.ubicacionService = ubicacionService;
    }

    public List<PuntoRuta> listarDeRecorrido(Long recorridoId) {
        recorridoService.obtener(recorridoId); // 404 si el recorrido no existe
        return puntoRutaRepository.findByRecorridoIdOrderByOrdenAsc(recorridoId);
    }

    public PuntoRuta obtener(Long id) {
        return puntoRutaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el punto de ruta con id " + id));
    }

    public PuntoRuta crear(PuntoRutaRequest request) {
        Recorrido recorrido = recorridoService.obtener(request.recorridoId()); // 404 si el recorrido no existe
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId()); // 404 si la ubicación no existe
        PuntoRuta puntoRuta = new PuntoRuta(
                request.tipo(),
                ubicacion,
                request.horaPrevista(),
                request.orden(),
                recorrido
        );
        return puntoRutaRepository.save(puntoRuta);
    }

    public PuntoRuta actualizar(Long id, PuntoRutaRequest request) {
        PuntoRuta puntoRuta = obtener(id);
        Recorrido recorrido = recorridoService.obtener(request.recorridoId());
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        puntoRuta.setTipo(request.tipo());
        puntoRuta.setUbicacion(ubicacion);
        puntoRuta.setHoraPrevista(request.horaPrevista());
        puntoRuta.setOrden(request.orden());
        puntoRuta.setRecorrido(recorrido);
        return puntoRutaRepository.save(puntoRuta);
    }

    public void eliminar(Long id) {
        PuntoRuta puntoRuta = obtener(id);
        puntoRutaRepository.delete(puntoRuta);
    }
}
