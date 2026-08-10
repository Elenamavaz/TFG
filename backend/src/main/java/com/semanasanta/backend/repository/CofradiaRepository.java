package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Cofradia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CofradiaRepository extends JpaRepository<Cofradia, Long> {

    // FK inversa: en vez de guardar la lista de cofradías dentro de Ciudad,
    // se consulta desde aquí cuando haga falta "las cofradías de una ciudad".
    List<Cofradia> findByCiudadId(Long ciudadId);
}
