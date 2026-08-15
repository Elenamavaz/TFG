package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.EventoRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.EventoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class EventoService {

    private final EventoRepository eventoRepository;
    private final CofradiaService cofradiaService;
    private final UbicacionService ubicacionService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public EventoService(EventoRepository eventoRepository, CofradiaService cofradiaService,
                          UbicacionService ubicacionService, MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.eventoRepository = eventoRepository;
        this.cofradiaService = cofradiaService;
        this.ubicacionService = ubicacionService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public List<Evento> listar() {
        return eventoRepository.findAll();
    }

    // Filtrados para el ciudadano (RI-01, GET público) y para
    // DetailCofradiaScreen del cliente -mismo patrón que
    // CofradiaService.listarDeCiudad. listar() sin filtro se mantiene.
    public List<Evento> listarDeCiudad(Long ciudadId) {
        return eventoRepository.findDistinctByCofradias_Ciudad_Id(ciudadId);
    }

    public List<Evento> listarDeCofradia(Long cofradiaId) {
        return eventoRepository.findDistinctByCofradias_Id(cofradiaId);
    }

    public Evento obtener(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el evento con id " + id));
    }

    public Evento crear(EventoRequest request) {
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId()); // 404 si la ubicación no existe
        // Resuelve y autoriza en un paso: todas las cofradiaIds deben ser de
        // la misma ciudad, y la Junta que las gestiona es quien puede crear.
        Set<Cofradia> cofradias = cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(request.cofradiaIds());
        Evento evento = new Evento(request.nombre(), request.historia(), request.tradicion(), request.fecha(), ubicacion);
        cofradias.forEach(evento::addCofradia);
        return eventoRepository.save(evento);
    }

    public Evento actualizar(Long id, EventoRequest request) {
        Evento evento = obtener(id);
        // Autoriza sobre el estado ACTUAL antes de mirar siquiera el request:
        // si no, una Junta de otra ciudad podría "robar" un evento ajeno
        // mandando cofradiaIds válidas para su propia ciudad.
        Long ciudadActualId = evento.getCofradias().iterator().next().getCiudad().getId();
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadActualId);

        Set<Cofradia> nuevasCofradias = cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(request.cofradiaIds());
        if (!nuevasCofradias.iterator().next().getCiudad().getId().equals(ciudadActualId)) {
            throw new AccesoDenegadoException("Un evento no puede moverse a otra ciudad");
        }

        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        evento.setNombre(request.nombre());
        evento.setHistoria(request.historia());
        evento.setTradicion(request.tradicion());
        evento.setFecha(request.fecha());
        evento.setUbicacion(ubicacion);
        evento.getCofradias().clear();
        nuevasCofradias.forEach(evento::addCofradia);
        // estado no se toca aquí: lo cambiará un endpoint propio más adelante.
        return eventoRepository.save(evento);
    }

    public void eliminar(Long id) {
        Evento evento = obtener(id);
        Long ciudadActualId = evento.getCofradias().iterator().next().getCiudad().getId();
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadActualId);
        eventoRepository.delete(evento);
    }
}
