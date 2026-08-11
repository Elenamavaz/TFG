package com.semanasanta.backend.repository;

import com.semanasanta.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Consulta polimórfica: aunque Usuario es abstracta, Spring Data JPA hace la
// búsqueda con un JOIN a las tres tablas de subtipo y devuelve la instancia
// concreta que corresponda (Administrador o MiembroJuntaCofradia, los dos
// únicos roles con email). Se usará para el login por email+contraseña.
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
}
