package com.semanasanta.backend.security;

// Lo que queda en el SecurityContext tras validar el JWT: lo justo para
// autorizar (id + rol) sin tener que ir a la base de datos en cada petición.
// Cuando un Service necesite el Usuario completo (p.ej. comparar la ciudad de
// una Junta), lo carga él mismo con este id.
//
// codigoId (2026-10-16, bug 10 de bugs.md): solo para el rol COFRADE, el
// código de acceso con el que entró. Así cada ping puede comprobar que ese
// código no se ha revocado después de emitir el JWT. null en el resto.
public record UsuarioPrincipal(Long id, String rol, Long codigoId) {

    public UsuarioPrincipal(Long id, String rol) {
        this(id, rol, null);
    }
}
