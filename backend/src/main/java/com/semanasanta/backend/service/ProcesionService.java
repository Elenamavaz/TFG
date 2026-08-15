package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.ProcesionRequest;
import com.semanasanta.backend.exception.AccesoDenegadoException;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.*;
import com.semanasanta.backend.repository.ProcesionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ProcesionService {

    private final ProcesionRepository procesionRepository;
    private final CofradiaService cofradiaService;
    private final UbicacionService ubicacionService;
    private final RecorridoService recorridoService;
    private final PasoService pasoService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public ProcesionService(ProcesionRepository procesionRepository, CofradiaService cofradiaService,
                             UbicacionService ubicacionService, RecorridoService recorridoService,
                             PasoService pasoService, MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.procesionRepository = procesionRepository;
        this.cofradiaService = cofradiaService;
        this.ubicacionService = ubicacionService;
        this.recorridoService = recorridoService;
        this.pasoService = pasoService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public List<Procesion> listar() {
        return procesionRepository.findAll();
    }

    // Mismo patrón que EventoService.listarDeCiudad/listarDeCofradia.
    public List<Procesion> listarDeCiudad(Long ciudadId) {
        return procesionRepository.findDistinctByCofradias_Ciudad_Id(ciudadId);
    }

    public List<Procesion> listarDeCofradia(Long cofradiaId) {
        return procesionRepository.findDistinctByCofradias_Id(cofradiaId);
    }

    public Procesion obtener(Long id) {
        return procesionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la procesión con id " + id));
    }

    public Procesion crear(ProcesionRequest request) {
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        Recorrido recorrido = resolverRecorrido(request.recorridoId(), null);
        // Resuelve y autoriza en un paso: todas las cofradiaIds deben ser de
        // la misma ciudad, y la Junta que las gestiona es quien puede crear.
        Set<Cofradia> cofradias = cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(request.cofradiaIds());
        Procesion procesion = new Procesion(
                request.nombre(), request.historia(), request.tradicion(), request.fecha(), ubicacion,
                request.fechaInicio(), request.fechaFin(), recorrido
        );
        cofradias.forEach(procesion::addCofradia);
        asignarPasos(procesion, request.pasosIds());
        return procesionRepository.save(procesion);
    }

    public Procesion actualizar(Long id, ProcesionRequest request) {
        Procesion procesion = obtener(id);
        // Autoriza sobre el estado ACTUAL antes de mirar el request (mismo
        // motivo que en EventoService: si no, una Junta de otra ciudad podría
        // "robar" una procesión ajena mandando cofradiaIds de la suya).
        Long ciudadActualId = procesion.getCofradias().iterator().next().getCiudad().getId();
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadActualId);

        Set<Cofradia> nuevasCofradias = cofradiaService.resolverYExigirJuntaDeCofradiasEnLaMismaCiudad(request.cofradiaIds());
        if (!nuevasCofradias.iterator().next().getCiudad().getId().equals(ciudadActualId)) {
            throw new AccesoDenegadoException("Una procesión no puede moverse a otra ciudad");
        }

        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        Long recorridoActualId = procesion.getRecorrido() != null ? procesion.getRecorrido().getId() : null;
        Recorrido recorrido = resolverRecorrido(request.recorridoId(), recorridoActualId);

        procesion.setNombre(request.nombre());
        procesion.setHistoria(request.historia());
        procesion.setTradicion(request.tradicion());
        procesion.setFecha(request.fecha());
        procesion.setUbicacion(ubicacion);
        procesion.setFechaInicio(request.fechaInicio());
        procesion.setFechaFin(request.fechaFin());
        procesion.setRecorrido(recorrido);
        procesion.getCofradias().clear();
        nuevasCofradias.forEach(procesion::addCofradia);
        // estado no se toca aquí: lo cambiará un endpoint propio más adelante.
        if (request.pasosIds() != null) {
            procesion.getPasos().clear();
            asignarPasos(procesion, request.pasosIds());
        }
        return procesionRepository.save(procesion);
    }

    public void eliminar(Long id) {
        Procesion procesion = obtener(id);
        Long ciudadActualId = procesion.getCofradias().iterator().next().getCiudad().getId();
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadActualId);
        procesionRepository.delete(procesion);
    }

    private void asignarPasos(Procesion procesion, List<Long> pasosIds) {
        if (pasosIds == null) {
            return;
        }
        for (Long pasoId : pasosIds) {
            procesion.addPaso(pasoService.obtener(pasoId)); // 404 si algún paso no existe
        }
    }

    // recorridoId es opcional (puede no haber ruta todavía); si se manda,
    // comprueba la relación 1:1 antes de dejar guardar (salvo que sea el mismo
    // recorrido que ya tenía esta procesión, en un update).
    private Recorrido resolverRecorrido(Long recorridoId, Long recorridoActualId) {
        if (recorridoId == null) {
            return null;
        }
        Recorrido recorrido = recorridoService.obtener(recorridoId); // 404 si no existe
        boolean esElMismoQueYaTenia = recorridoId.equals(recorridoActualId);
        if (!esElMismoQueYaTenia && procesionRepository.existsByRecorridoId(recorridoId)) {
            throw new RecursoDuplicadoException("El recorrido con id " + recorridoId + " ya está asignado a otra procesión");
        }
        return recorrido;
    }
}
