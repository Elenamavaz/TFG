package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.NotificacionRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.exception.SolicitudInvalidaException;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.EstadoEvento;
import com.semanasanta.backend.model.Evento;
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
    private final PushNotificacionService pushNotificacionService;

    public NotificacionService(NotificacionRepository notificacionRepository, CiudadService ciudadService,
                                MiembroJuntaCofradiaService miembroJuntaCofradiaService,
                                PushNotificacionService pushNotificacionService) {
        this.notificacionRepository = notificacionRepository;
        this.ciudadService = ciudadService;
        this.miembroJuntaCofradiaService = miembroJuntaCofradiaService;
        this.pushNotificacionService = pushNotificacionService;
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
        Notificacion guardada = notificacionRepository.save(notificacion);
        // El push es una entrega best-effort además de la Notificacion
        // guardada, no en su lugar -ver PushNotificacionService: si falla,
        // la Notificacion ya está guardada y consultable igualmente.
        pushNotificacionService.enviarACiudad(ciudad.getId(), guardada.getTitulo(), guardada.getMensaje());
        return guardada;
    }

    // Aviso automático al pasar un evento/procesión a EN_CURSO/FINALIZADO
    // (INICIO/FIN). Lo llaman ProcesionService.actualizar (cambio a mano
    // desde el formulario) y CambioEstadoAutomaticoService (al llegar la
    // hora). Cualquier otro estado no avisa solo.
    public void notificarCambioDeEstado(Evento evento) {
        Ciudad ciudad = evento.getCofradias().iterator().next().getCiudad();
        if (evento.getEstado() == EstadoEvento.EN_CURSO) {
            crearAutomatica(ciudad, TipoNotificacion.INICIO, "Ha comenzado: " + evento.getNombre(), null);
        } else if (evento.getEstado() == EstadoEvento.FINALIZADO) {
            crearAutomatica(ciudad, TipoNotificacion.FIN, "Ha finalizado: " + evento.getNombre(), null);
        }
    }

    // Vía interna para INICIO/FIN (los genera el sistema, no la Junta): sin
    // exigirJuntaDeLaCiudad porque quien llama ya ha autorizado a la Junta
    // (o es la tarea automática, sin Junta detrás), y sin prioridad (el
    // cliente la trata como informativa, ver Notificacion.colorCategoria).
    public Notificacion crearAutomatica(Ciudad ciudad, TipoNotificacion tipo, String titulo, String mensaje) {
        Notificacion guardada = notificacionRepository.save(
                new Notificacion(titulo, mensaje, ciudad, tipo, null, null));
        pushNotificacionService.enviarACiudad(ciudad.getId(), guardada.getTitulo(), guardada.getMensaje());
        return guardada;
    }

    // Retractar una notificación ya enviada (no hay "editar": ver Notificacion).
    public void eliminar(Long id) {
        Notificacion notificacion = obtener(id);
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(notificacion.getCiudad().getId());
        notificacionRepository.delete(notificacion);
    }
}
