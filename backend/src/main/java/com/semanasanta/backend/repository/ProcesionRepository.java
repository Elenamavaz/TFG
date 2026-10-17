package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Procesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProcesionRepository extends JpaRepository<Procesion, Long> {

    // "recorrido.id" por debajo: comprueba la regla 1:1 antes de guardar,
    // igual que existsByCiudadId en JuntaCofradiasRepository.
    boolean existsByRecorridoId(Long recorridoId);

    // Mismo motivo que EventoRepository (cofradias es N:M, heredado de
    // Evento): "de una ciudad"/"de una cofradía" es a través de esa relación.
    List<Procesion> findDistinctByCofradias_Ciudad_Id(Long ciudadId);

    List<Procesion> findDistinctByCofradias_Id(Long cofradiaId);

    // Dueño de un Recorrido (relación 1:1): para saber de qué ciudad es y,
    // por tanto, qué Junta puede editarlo (ver AutorizacionRecorridoService).
    Optional<Procesion> findByRecorridoId(Long recorridoId);
}
