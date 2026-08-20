package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.NotificacionRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.exception.SolicitudInvalidaException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Notificacion;
import com.semanasanta.backend.model.TipoNotificacion;
import com.semanasanta.backend.repository.NotificacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class NotificacionService {

    // INICIO/FIN no son creables a mano por la Junta -los genera el propio
    // sistema (ver crearAutomatica) cuando Evento.estado cambia.
    private static final Set<TipoNotificacion> TIPOS_AUTOMATICOS = Set.of(TipoNotificacion.INICIO, TipoNotificacion.FIN);

    private final NotificacionRepository notificacionRepository;
    private final CiudadService ciudadService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public NotificacionService(NotificacionRepository notificacionRepository, CiudadService ciudadService,
                                MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.notificacionRepository = notificacionRepository;
        this.ciudadService = ciudadService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
    }

    public Notificacion obtener(Long id) {
        return notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la notificación con id " + id));
    }

    // Público (todo GET lo es, ver SecurityConfig): el ciudadano sin login
    // consulta las notificaciones de la ciudad que está mirando (RI-01).
    public List<Notificacion> listarDeCiudad(Long ciudadId) {
        ciudadService.obtener(ciudadId); // 404 si la ciudad no existe
        return notificacionRepository.findByCiudadIdOrderByFechaCreacionDesc(ciudadId);
    }

    // La única vía de creación a mano (la Junta redactando una incidencia,
    // cambio de horario o cancelación). INICIO/FIN quedan fuera a propósito.
    public Notificacion crear(NotificacionRequest request) {
        if (TIPOS_AUTOMATICOS.contains(request.tipo())) {
            throw new SolicitudInvalidaException(
                    "El tipo " + request.tipo() + " lo genera el sistema, no se puede crear a mano");
        }
        if (request.prioridad() == null) {
            throw new SolicitudInvalidaException("La prioridad es obligatoria para este tipo de notificación");
        }
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudad.getId());
        Notificacion notificacion = new Notificacion(request.titulo(), request.mensaje(), ciudad, request.tipo(),
                request.prioridad(), request.fechaExpiracion());
        return notificacionRepository.save(notificacion);
    }

    // Retractar una notificación ya enviada (no hay "editar": ver Notificacion).
    public void eliminar(Long id) {
        Notificacion notificacion = obtener(id);
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(notificacion.getCiudad().getId());
        notificacionRepository.delete(notificacion);
    }
}
