package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.CodigoAcceso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CodigoAccesoRepository extends JpaRepository<CodigoAcceso, Long> {
    Optional<CodigoAcceso> findByCodigo(String codigo);

    List<CodigoAcceso> findByCofradiaId(Long cofradiaId);
}
