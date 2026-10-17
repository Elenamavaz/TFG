package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.PuntoRuta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PuntoRutaRepository extends JpaRepository<PuntoRuta, Long> {

    List<PuntoRuta> findByUbicacionId(Long ubicacionId);

    boolean existsByUbicacionId(Long ubicacionId);
}
