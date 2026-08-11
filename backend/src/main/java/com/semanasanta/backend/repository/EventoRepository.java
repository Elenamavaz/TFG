package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {
    List<Evento> findByCofradiaId(Long cofradiaId);
}
