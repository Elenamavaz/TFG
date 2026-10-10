package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.CancelarProcesionRequest;
import com.semanasanta.backend.dto.EventoRequest;
import com.semanasanta.backend.dto.NotificacionRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.Procesion;
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

    // Herencia JOINED: un findAll/findBy... de Evento devuelve también las
    // Procesion (son Evento). El cliente pide las procesiones aparte
    // (GET /procesiones) y junta las dos listas en Inicio, Calendario,
    // Buscar... -sin este filtro cada procesión salía dos veces (2026-10-10).
    public List<Evento> listar() {
        return sinProcesiones(eventoRepository.findAll());
    }

    // Filtrados para el ciudadano (RI-01, GET público) y para
    // DetailCofradiaScreen del cliente -mismo patrón que
    // CofradiaService.listarDeCiudad. listar() sin filtro se mantiene.
    public List<Evento> listarDeCiudad(Long ciudadId) {
        return sinProcesiones(eventoRepository.findDistinctByCofradias_Ciudad_Id(ciudadId));
    }

    public List<Evento> listarDeCofradia(Long cofradiaId) {
        return sinProcesiones(eventoRepository.findDistinctByCofradias_Id(cofradiaId));
    }

    private static List<Evento> sinProcesiones(List<Evento> eventos) {
        return eventos.stream().filter(evento -> !(evento instanceof Procesion)).toList();
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
        HorarioEventos.validarHorario(request.fecha(), request.fechaFin());
        Evento evento = new Evento(request.nombre(), request.historia(), request.tradicion(), request.fecha(), ubicacion,
                request.web());
        evento.setFechaFin(request.fechaFin());
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
        HorarioEventos.validarHorario(request.fecha(), request.fechaFin());
        evento.setNombre(request.nombre());
        evento.setHistoria(request.historia());
        evento.setTradicion(request.tradicion());
        evento.setFecha(request.fecha());
        evento.setFechaFin(request.fechaFin());
        evento.setUbicacion(ubicacion);
        evento.setWeb(request.web());
        evento.getCofradias().clear();
        nuevasCofradias.forEach(evento::addCofradia);
        if (request.pasosIds() != null) {
            evento.getPasos().clear();
            asignarPasos(evento, request.pasosIds());
        }
        // Estado editable desde el formulario (2026-10-02, mismo cambio que
        // ProcesionService.actualizar): corrección manual de lo que hace solo
        // CambioEstadoAutomaticoService al llegar la hora. Validado con las
        // fechas YA actualizadas.
        boolean cambiaEstado = HorarioEventos.aplicarEstadoManual(evento, request.estado());
        Evento guardado = eventoRepository.save(evento);
        if (cambiaEstado) {
            notificacionService.notificarCambioDeEstado(guardado); // INICIO/FIN; el resto no avisa solo
        }
        return guardado;
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
                evento.getNombre(), // "Cancelación" lo pone el tipo (ver TipoNotificacion)
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
