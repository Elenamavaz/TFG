package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.JuntaCofradias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JuntaCofradiasRepository extends JpaRepository<JuntaCofradias, Long> {

    // Spring Data JPA genera la consulta a partir del nombre del método:
    // "existsBy" + "CiudadId" -> SELECT EXISTS (... WHERE ciudad_id = ?).
    // La usa el Service para comprobar la regla 1:1 antes de guardar.
    boolean existsByCiudadId(Long ciudadId);

    // La usa NotificacionService para saber a qué Junta (y por tanto a qué
    // miembros) entregar una notificación recién creada.
    Optional<JuntaCofradias> findByCiudadId(Long ciudadId);
}
