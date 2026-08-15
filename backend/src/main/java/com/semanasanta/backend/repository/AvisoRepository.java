package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AvisoRepository extends JpaRepository<Aviso, Long> {
}
