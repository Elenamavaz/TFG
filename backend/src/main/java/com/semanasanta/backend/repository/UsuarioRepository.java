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

    // Antes de dar de alta un Administrador o Miembro de Junta: el email es
    // UNIQUE en usuarios, y sin esta comprobación el duplicado reventaba como
    // un 500 de la base de datos. Sin distinguir mayúsculas, para que
    // "Ana@x.es" y "ana@x.es" no acaben siendo dos cuentas distintas.
    boolean existsByEmailIgnoreCase(String email);
}
