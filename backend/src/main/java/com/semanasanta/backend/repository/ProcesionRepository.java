package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Procesion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProcesionRepository extends JpaRepository<Procesion, Long> {

    // "recorrido.id" por debajo: comprueba la regla 1:1 antes de guardar,
    // igual que existsByCiudadId en JuntaCofradiasRepository.
    boolean existsByRecorridoId(Long recorridoId);
}
