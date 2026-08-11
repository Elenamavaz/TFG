package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.PosicionActual;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PosicionActualRepository extends JpaRepository<PosicionActual, Long> {

    // Histórico completo de una procesión, más reciente primero.
    List<PosicionActual> findByProcesionIdOrderByTimestampDesc(Long procesionId);

    // "Posición actual" = la lectura más reciente de esa procesión.
    Optional<PosicionActual> findFirstByProcesionIdOrderByTimestampDesc(Long procesionId);
}
