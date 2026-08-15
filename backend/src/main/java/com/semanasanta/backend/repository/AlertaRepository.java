package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Alerta;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertaRepository extends JpaRepository<Alerta, Long> {
}
