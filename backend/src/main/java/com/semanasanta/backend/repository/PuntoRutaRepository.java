package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.PuntoRuta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PuntoRutaRepository extends JpaRepository<PuntoRuta, Long> {

    // Ordenados por "orden" para poder pintar/recorrer la ruta en secuencia.
    List<PuntoRuta> findByRecorridoIdOrderByOrdenAsc(Long recorridoId);
}
