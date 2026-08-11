package com.semanasanta.backend.security;

// Lo que queda en el SecurityContext tras validar el JWT: lo justo para
// autorizar (id + rol) sin tener que ir a la base de datos en cada petición.
// Cuando un Service necesite el Usuario completo (p.ej. comparar la ciudad de
// una Junta), lo carga él mismo con este id.
public record UsuarioPrincipal(Long id, String rol) {
}
