package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.PuntoDeInteresRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.PuntoDeInteres;
import com.semanasanta.backend.model.Ubicacion;
import com.semanasanta.backend.repository.PuntoDeInteresRepository;
import org.springframework.stereotype.Service;

@Service
public class PuntoDeInteresService {

    private final PuntoDeInteresRepository puntoDeInteresRepository;
    private final UbicacionService ubicacionService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;
    private final AutorizacionRecorridoService autorizacionRecorridoService;

    public PuntoDeInteresService(PuntoDeInteresRepository puntoDeInteresRepository, UbicacionService ubicacionService,
                                  MiembroJuntaCofradiaService miembroJuntaCofradiaService,
                                  AutorizacionRecorridoService autorizacionRecorridoService) {
        this.puntoDeInteresRepository = puntoDeInteresRepository;
        this.ubicacionService = ubicacionService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
        this.autorizacionRecorridoService = autorizacionRecorridoService;
    }

    public PuntoDeInteres obtener(Long id) {
        return puntoDeInteresRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el punto de interés con id " + id));
    }

    // PuntoDeInteres no tiene dueño único, mismo motivo que PuntoRuta.
    public PuntoDeInteres crear(PuntoDeInteresRequest request) {
        miembroJuntaCofradiaService.exigirJunta();
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId()); // 404 si la ubicación no existe
        PuntoDeInteres puntoDeInteres = new PuntoDeInteres(
                request.tipo(), request.nombre(), request.descripcion(), request.imagen(), ubicacion
        );
        return puntoDeInteresRepository.save(puntoDeInteres);
    }

    public PuntoDeInteres actualizar(Long id, PuntoDeInteresRequest request) {
        // Del recurso concreto, no "cualquier Junta" (bug 25, ver AutorizacionRecorridoService).
        autorizacionRecorridoService.exigirPuedeEditarPuntoRuta(id);
        PuntoDeInteres puntoDeInteres = obtener(id);
        Ubicacion ubicacion = ubicacionService.obtener(request.ubicacionId());
        puntoDeInteres.setTipo(request.tipo());
        puntoDeInteres.setNombre(request.nombre());
        puntoDeInteres.setDescripcion(request.descripcion());
        puntoDeInteres.setImagen(request.imagen());
        puntoDeInteres.setUbicacion(ubicacion);
        return puntoDeInteresRepository.save(puntoDeInteres);
    }

    public void eliminar(Long id) {
        // Del recurso concreto, no "cualquier Junta" (bug 25, ver AutorizacionRecorridoService).
        autorizacionRecorridoService.exigirPuedeEditarPuntoRuta(id);
        PuntoDeInteres puntoDeInteres = obtener(id);
        puntoDeInteresRepository.delete(puntoDeInteres);
    }
}
