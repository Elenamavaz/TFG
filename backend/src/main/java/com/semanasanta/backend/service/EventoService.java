package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.EventoRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.EventoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final CofradiaService cofradiaService;
    private final UbicacionService ubicacionService;

    public EventoService(EventoRepository eventoRepository, CofradiaService cofradiaService,
                          UbicacionService ubicacionService) {
        this.eventoRepository = eventoRepository;
        this.cofradiaService = cofradiaService;
        this.ubicacionService = ubicacionService;
    }

    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    public Evento obtener(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el evento con id " + id));
    }

    public Evento crear(EventoRequest request) {
        Cofradia cofradia = cofradiaService.obtener(request.cofradiaId()); // 404 si la cofradía no existe
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId()); // 404 si la ubicación no existe
        Evento evento = new Evento(request.nombre(), request.historia(), request.tradicion(), request.fecha(), cofradia, ubicacion);
        return eventoRepository.save(evento);
    }

    public Evento actualizar(Long id, EventoRequest request) {
        Evento evento = obtener(id);
        Cofradia cofradia = cofradiaService.obtener(request.cofradiaId());
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        evento.setNombre(request.nombre());
        evento.setHistoria(request.historia());
        evento.setTradicion(request.tradicion());
        evento.setFecha(request.fecha());
        evento.setCofradia(cofradia);
        evento.setUbicacion(ubicacion);
        // estado no se toca aquí: lo cambiará un endpoint propio más adelante.
        return eventoRepository.save(evento);
    }

    public void eliminar(Long id) {
        Evento evento = obtener(id);
        eventoRepository.delete(evento);
    }
}
