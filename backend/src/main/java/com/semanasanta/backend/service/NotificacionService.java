package com.semanasanta.backend.service;

import com.semanasanta.backend.dto.AlertaRequest;
import com.semanasanta.backend.dto.AvisoRequest;
import com.semanasanta.backend.exception.RecursoNoEncontradoException;
import com.semanasanta.backend.model.Alerta;
import com.semanasanta.backend.model.Aviso;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Notificacion;
import com.semanasanta.backend.repository.AlertaRepository;
import com.semanasanta.backend.repository.AvisoRepository;
import com.semanasanta.backend.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final AvisoRepository avisoRepository;
    private final AlertaRepository alertaRepository;
    private final CiudadService ciudadService;
    private final MiembroJuntaCofradiaService miembroJuntaCofradiaService;

    public NotificacionService(NotificacionRepository notificacionRepository, AvisoRepository avisoRepository,
                                AlertaRepository alertaRepository, CiudadService ciudadService,
                                MiembroJuntaCofradiaService miembroJuntaCofradiaService) {
        this.notificacionRepository = notificacionRepository;
        this.avisoRepository = avisoRepository;
        this.alertaRepository = alertaRepository;
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

    public Aviso crearAviso(AvisoRequest request) {
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudad.getId());
        Aviso aviso = new Aviso(request.titulo(), ciudad, request.fechaExpiracion());
        return avisoRepository.save(aviso);
    }

    public Alerta crearAlerta(AlertaRequest request) {
        Ciudad ciudad = ciudadService.obtener(request.ciudadId()); // 404 si la ciudad no existe
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(ciudad.getId());
        Alerta alerta = new Alerta(request.titulo(), ciudad, request.tipoAlerta(), request.prioridad());
        return alertaRepository.save(alerta);
    }

    // Retractar una notificación ya enviada (no hay "editar": ver Notificacion).
    @Transactional
    public void eliminar(Long id) {
        Notificacion notificacion = obtener(id);
        miembroJuntaCofradiaService.exigirJuntaDeLaCiudad(notificacion.getCiudad().getId());
        notificacionRepository.delete(notificacion);
    }
}
