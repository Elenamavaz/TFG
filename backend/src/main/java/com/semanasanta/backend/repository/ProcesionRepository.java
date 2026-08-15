package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Procesion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcesionRepository extends JpaRepository<Procesion, Long> {

    // "recorrido.id" por debajo: comprueba la regla 1:1 antes de guardar,
    // igual que existsByCiudadId en JuntaCofradiasRepository.
    boolean existsByRecorridoId(Long recorridoId);

    // Mismo motivo que EventoRepository (cofradias es N:M, heredado de
    // Evento): "de una ciudad"/"de una cofradía" es a través de esa relación.
    List<Procesion> findDistinctByCofradias_Ciudad_Id(Long ciudadId);

    List<Procesion> findDistinctByCofradias_Id(Long cofradiaId);
}
