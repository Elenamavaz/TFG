package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CancelarProcesionRequest;
import com.semanasanta.backend.dto.EventoRequest;
import com.semanasanta.backend.dto.NotificacionRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.TipoNotificacion;
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
    private final PasoService pasoService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    private final NotificacionService notificacionService;

    public EventoService(EventoRepository eventoRepository, CofradiaService cofradiaService,
                          UbicacionService ubicacionService, PasoService pasoService,
                          MiembroJuntaCofradiaService miembroJuntaCofradiaService, NotificacionService notificacionService) {
        this.eventoRepository = eventoRepository;
        this.cofradiaService = cofradiaService;
        this.ubicacionService = ubicacionService;
        this.pasoService = pasoService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
        this.notificacionService = notificacionService;
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
        Evento evento = new Evento(request.nombre(), request.historia(), request.tradicion(), request.fecha(), ubicacion,
                request.web());
        cofradias.forEach(evento::addCofradia);
        asignarPasos(evento, request.pasosIds());
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
        evento.setWeb(request.web());
        evento.getCofradias().clear();
        nuevasCofradias.forEach(evento::addCofradia);
        // estado no se toca aquí: lo cambiará un endpoint propio más adelante.
        if (request.pasosIds() != null) {
            evento.getPasos().clear();
            asignarPasos(evento, request.pasosIds());
        }
        return eventoRepository.save(evento);
    }

    public void eliminar(Long id) {
        Evento evento = obtener(id);
        Long ciudadActualId = evento.getCofradias().iterator().next().getCiudad().getId();
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadActualId);
        eventoRepository.delete(evento);
    }

    // "Cancelar" del panel de Junta (2026-08-23): mismo patrón que
    // ProcesionService.cancelar -el evento sigue existiendo, solo cambia de
    // estado, y genera la Notificacion CANCELACION para avisar al ciudadano.
    // Reutiliza CancelarProcesionRequest (mismo cuerpo: mensaje+prioridad,
    // nada específico de Procesion) en vez de duplicar un DTO idéntico.
    public Evento cancelar(Long id, CancelarProcesionRequest request) {
        Evento evento = obtener(id);
        Long ciudadActualId = evento.getCofradias().iterator().next().getCiudad().getId();
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadActualId);
        evento.setEstado(EstadoEvento.CANCELADO);
        Evento cancelado = eventoRepository.save(evento);
        notificacionService.crear(new NotificacionRequest(
                "Cancelado: " + evento.getNombre(),
                request.mensaje(),
                ciudadActualId,
                TipoNotificacion.CANCELACION,
                request.prioridad(),
                null
        ));
        return cancelado;
    }

    // pasosIds es opcional: si viene null, no se toca nada (ni al crear -el
    // evento nace sin pasos- ni al actualizar -actualizar() ya comprueba el
    // null antes de llamar aquí y de vaciar la colección). Mismo patrón que
    // ProcesionService.asignarPasos.
    private void asignarPasos(Evento evento, List<Long> pasosIds) {
        if (pasosIds == null) {
            return;
        }
        for (Long pasoId : pasosIds) {
            evento.addPaso(pasoService.obtener(pasoId)); // 404 si algún paso no existe
        }
    }
}
