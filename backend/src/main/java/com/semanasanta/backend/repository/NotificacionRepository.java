package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByCiudadIdOrderByFechaCreacionDesc(Long ciudadId);
}
