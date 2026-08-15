package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    // cofradias es N:M (ver Evento.cofradias): un evento puede tener varias
    // cofradías participantes, así que "de una ciudad" es "alguna de sus
    // cofradías es de esa ciudad" -Distinct porque, si el evento tuviera dos
    // cofradías de la misma ciudad (no debería, pero no lo impide la BD),
    // saldría duplicado sin él.
    List<Evento> findDistinctByCofradias_Ciudad_Id(Long ciudadId);

    List<Evento> findDistinctByCofradias_Id(Long cofradiaId);
}
