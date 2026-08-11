package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.RecorridoPuntoRuta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RecorridoPuntoRutaRepository extends JpaRepository<RecorridoPuntoRuta, Long> {

    List<RecorridoPuntoRuta> findByRecorridoIdOrderByOrdenAsc(Long recorridoId);

    boolean existsByRecorridoIdAndPuntoRutaId(Long recorridoId, Long puntoRutaId);

    boolean existsByRecorridoIdAndOrden(Long recorridoId, Integer orden);
}
