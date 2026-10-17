package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.MarcarPuntoDeInteresRequest;
import com.semanasanta.backend.dto.PuntoDeInteresRequest;
import com.semanasanta.backend.dto.PuntoEnRecorridoRequest;
import com.semanasanta.backend.exception.RecursoDuplicadoException;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.model.PuntoRuta;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import com.semanasanta.backend.util.GeometriaRuta;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecorridoPuntoRutaService {

    private final RecorridoPuntoRutaRepository recorridoPuntoRutaRepository;
    private final RecorridoService recorridoService;
    private final PuntoRutaService puntoRutaService;
    private final PuntoDeInteresService puntoDeInteresService;
    private final AutorizacionRecorridoService autorizacionRecorridoService;
    private final PuntoRutaRepository puntoRutaRepository;

    public RecorridoPuntoRutaService(RecorridoPuntoRutaRepository recorridoPuntoRutaRepository,
                                      RecorridoService recorridoService, PuntoRutaService puntoRutaService,
                                      PuntoDeInteresService puntoDeInteresService,
                                      AutorizacionRecorridoService autorizacionRecorridoService,
                                      PuntoRutaRepository puntoRutaRepository) {
        this.recorridoPuntoRutaRepository = recorridoPuntoRutaRepository;
        this.recorridoService = recorridoService;
        this.puntoRutaService = puntoRutaService;
        this.puntoDeInteresService = puntoDeInteresService;
        this.autorizacionRecorridoService = autorizacionRecorridoService;
        this.puntoRutaRepository = puntoRutaRepository;
    }

    public List<RecorridoPuntoRuta> listar(Long recorridoId) {
        recorridoService.obtener(recorridoId); // 404 si el recorrido no existe
        return recorridoPuntoRutaRepository.findByRecorridoIdOrderByOrdenAsc(recorridoId);
    }

    // Los puntos del recorrido, en orden, como coordenadas planas -para los
    // cálculos geométricos de PosicionActualService (filtrar pings fuera de
    // ruta, calcular el progreso de la procesión para la estela en vivo).
    public List<GeometriaRuta.PuntoGeo> puntosGeo(Long recorridoId) {
        return listar(recorridoId).stream()
                .map(relacion -> relacion.getPuntoRuta().getUbicacion())
                .map(ubicacion -> new GeometriaRuta.PuntoGeo(ubicacion.getLatitud(), ubicacion.getLongitud()))
                .toList();
    }

    // Recorrido/PuntoRuta no tienen dueño único: basta con ser cualquier Junta.
    public RecorridoPuntoRuta agregar(Long recorridoId, PuntoEnRecorridoRequest request) {
        // Del recurso concreto, no "cualquier Junta" (bug 25, ver AutorizacionRecorridoService).
        autorizacionRecorridoService.exigirPuedeEditarRecorrido(recorridoId);
        Recorrido recorrido = recorridoService.obtener(recorridoId);
        PuntoRuta puntoRuta = puntoRutaService.obtener(request.puntoRutaId()); // 404 si el punto no existe

        if (recorridoPuntoRutaRepository.existsByRecorridoIdAndPuntoRutaId(recorridoId, puntoRuta.getId())) {
            throw new RecursoDuplicadoException(
                    "El punto con id " + puntoRuta.getId() + " ya está en el recorrido " + recorridoId);
        }
        if (recorridoPuntoRutaRepository.existsByRecorridoIdAndOrden(recorridoId, request.orden())) {
            throw new RecursoDuplicadoException(
                    "El recorrido " + recorridoId + " ya tiene un punto en la posición " + request.orden());
        }

        RecorridoPuntoRuta relacion = new RecorridoPuntoRuta(recorrido, puntoRuta, request.orden(), request.horaPrevista());
        return recorridoPuntoRutaRepository.save(relacion);
    }

    // Quita el punto de ESTE recorrido (no borra el PuntoRuta, que puede
    // seguir formando parte de otros recorridos).
    public void quitar(Long recorridoId, Long relacionId) {
        autorizacionRecorridoService.exigirPuedeEditarRecorrido(recorridoId);
        RecorridoPuntoRuta relacion = recorridoPuntoRutaRepository.findById(relacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe esa relación punto-recorrido"));
        if (!relacion.getRecorrido().getId().equals(recorridoId)) {
            throw new RecursoNoEncontradoException("Ese punto no pertenece al recorrido " + recorridoId);
        }
        recorridoPuntoRutaRepository.delete(relacion);
    }

    // "Convierte" un punto de paso simple -uno de los que trae el GPX
    // importado, sin nombre ni tipo- en un PuntoDeInteres (un encuentro, una
    // entrada a una iglesia, una parada para una lectura...), 2026-08-23.
    // Con herencia JOINED, un PuntoDeInteres nuevo SIEMPRE nace con un id
    // propio (no se puede "convertir" el PuntoRuta existente en su sitio),
    // así que en realidad se crea un PuntoDeInteres nuevo -reutilizando la
    // Ubicacion del punto de paso original, para que no cambie de sitio en
    // el mapa- y se repunta esta relación a él; el PuntoRuta antiguo queda
    // huérfano (deja de estar en ningún recorrido) pero no se borra, por si
    // formara parte de otro recorrido a la vez.
    public RecorridoPuntoRuta marcarComoPuntoDeInteres(Long recorridoId, Long relacionId, MarcarPuntoDeInteresRequest request) {
        autorizacionRecorridoService.exigirPuedeEditarRecorrido(recorridoId);
        RecorridoPuntoRuta relacion = recorridoPuntoRutaRepository.findById(relacionId)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe esa relación punto-recorrido"));
        if (!relacion.getRecorrido().getId().equals(recorridoId)) {
            throw new RecursoNoEncontradoException("Ese punto no pertenece al recorrido " + recorridoId);
        }
        PuntoRuta puntoAnterior = relacion.getPuntoRuta();
        Long ubicacionId = puntoAnterior.getUbicacion().getId();
        PuntoDeInteres puntoDeInteres = puntoDeInteresService.crear(
                new PuntoDeInteresRequest(request.tipo(), request.nombre(), request.descripcion(), request.imagen(), ubicacionId)
        );
        relacion.setPuntoRuta(puntoDeInteres);
        RecorridoPuntoRuta guardada = recorridoPuntoRutaRepository.save(relacion);
        // El punto sustituido quedaba huérfano (bug 26): se borra si ya no lo
        // usa ningún otro recorrido. Su Ubicacion no, la usa el nuevo punto.
        if (!recorridoPuntoRutaRepository.existsByPuntoRutaId(puntoAnterior.getId())) {
            puntoRutaRepository.delete(puntoAnterior);
        }
        return guardada;
    }
}
