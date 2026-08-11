package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Paso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasoRepository extends JpaRepository<Paso, Long> {
    List<Paso> findByCofradiaId(Long cofradiaId);
}
