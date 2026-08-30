package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.DispositivoPush;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DispositivoPushRepository extends JpaRepository<DispositivoPush, Long> {

    Optional<DispositivoPush> findByToken(String token);

    // A quién avisar cuando se crea una Notificacion de esta ciudad -ver
    // PushNotificacionService.enviarACiudad.
    List<DispositivoPush> findByCiudadId(Long ciudadId);
}
