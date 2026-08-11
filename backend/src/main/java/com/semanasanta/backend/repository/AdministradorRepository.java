package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
}
