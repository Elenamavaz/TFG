package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.PosicionActual;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface PosicionActualRepository extends JpaRepository<PosicionActual, Long> {

    // Histórico completo de una procesión, más reciente primero.
    List<PosicionActual> findByProcesionIdOrderByTimestampDesc(Long procesionId);

    // Pings de los últimos ~60s: de aquí sale la "posición actual" calculada
    // (promedio), no de una única fila guardada.
    List<PosicionActual> findByProcesionIdAndTimestampAfter(Long procesionId, LocalDateTime desde);

    // Al eliminar una procesión: sus pings son su histórico, no tienen
    // sentido sin ella (y su FK impedía borrarla una vez compartida la ubicación).
    void deleteByProcesionId(Long procesionId);
}
