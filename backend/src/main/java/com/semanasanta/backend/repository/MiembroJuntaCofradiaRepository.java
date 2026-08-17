package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.MiembroJuntaCofradia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MiembroJuntaCofradiaRepository extends JpaRepository<MiembroJuntaCofradia, Long> {
    List<MiembroJuntaCofradia> findByJuntaCofradiasId(Long juntaCofradiasId);

    List<MiembroJuntaCofradia> findBySolicitudReactivacionPendienteTrue();
}
