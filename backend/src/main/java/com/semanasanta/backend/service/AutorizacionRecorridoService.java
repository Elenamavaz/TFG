package com.semanasanta.backend.service;

import com.semanasanta.backend.model.Evento;
import com.semanasanta.backend.model.RecorridoPuntoRuta;
import com.semanasanta.backend.repository.EventoRepository;
import com.semanasanta.backend.repository.ProcesionRepository;
import com.semanasanta.backend.repository.PuntoRutaRepository;
import com.semanasanta.backend.repository.RecorridoPuntoRutaRepository;
import org.springframework.stereotype.Service;

// Quién puede MODIFICAR un Recorrido, PuntoRuta/PuntoDeInteres o Ubicacion
// (bug 25 de bugs.md, 2026-10-16). Estas entidades no tienen ciudad propia,
// y hasta ahora bastaba con ser "cualquier Junta": la de una ciudad podía
// editar o borrar el recorrido de una procesión de otra. Ahora la ciudad se
// deduce de para qué se usa:
// - Recorrido -> la Procesion que lo sigue (1:1).
// - PuntoRuta -> el/los Recorrido(s) en los que aparece.
// - Ubicacion -> los Evento/Procesion que se celebran en ella y los
//   PuntoRuta que la usan.
// Si todavía no está asignado a nada (p.ej. un GPX recién importado, antes
// de guardar la procesión) sigue bastando con ser una Junta activa: aún no
// es "de" ninguna ciudad.
//
// Solo usa repositorios (no Services de dominio) para no crear ciclos:
// RecorridoService, UbicacionService... dependen de este.
@Service
public class AutorizacionRecorridoService {

    private final ProcesionRepository procesionRepository;
    private final EventoRepository eventoRepository;
    private final RecorridoPuntoRutaRepository recorridoPuntoRutaRepository;
    private final PuntoRutaRepository puntoRutaRepository;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public AutorizacionRecorridoService(ProcesionRepository procesionRepository, EventoRepository eventoRepository,
                                        RecorridoPuntoRutaRepository recorridoPuntoRutaRepository,
                                        PuntoRutaRepository puntoRutaRepository,
                                        MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.procesionRepository = procesionRepository;
        this.eventoRepository = eventoRepository;
        this.recorridoPuntoRutaRepository = recorridoPuntoRutaRepository;
        this.puntoRutaRepository = puntoRutaRepository;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public void exigirPuedeEditarRecorrido(Long recorridoId) {
        miembroJuntaCofradiaService.exigirJunta();
        procesionRepository.findByRecorridoId(recorridoId).ifPresent(this::exigirJuntaDe);
    }

    public void exigirPuedeEditarPuntoRuta(Long puntoRutaId) {
        miembroJuntaCofradiaService.exigirJunta();
        for (RecorridoPuntoRuta uso : recorridoPuntoRutaRepository.findByPuntoRutaId(puntoRutaId)) {
            procesionRepository.findByRecorridoId(uso.getRecorrido().getId()).ifPresent(this::exigirJuntaDe);
        }
    }

    public void exigirPuedeEditarUbicacion(Long ubicacionId) {
        miembroJuntaCofradiaService.exigirJunta();
        eventoRepository.findByUbicacionId(ubicacionId).forEach(this::exigirJuntaDe);
        puntoRutaRepository.findByUbicacionId(ubicacionId)
                .forEach(puntoRuta -> exigirPuedeEditarPuntoRuta(puntoRuta.getId()));
    }

    // Mismo criterio que EventoService/ProcesionService: todas las cofradías
    // de un evento son de la misma ciudad, basta con la primera.
    private void exigirJuntaDe(Evento evento) {
        if (!evento.getCofradias().isEmpty()) {
            Long ciudadId = evento.getCofradias().iterator().next().getCiudad().getId();
            miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudadId);
        }
    }
}
