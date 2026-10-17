package com.semanasanta.backend.support;

import com.semanasanta.backend.model.Administrador;
import com.semanasanta.backend.model.Ciudad;
import com.semanasanta.backend.model.Cofradia;
import com.semanasanta.backend.model.JuntaCofradias;
import com.semanasanta.backend.model.MiembroJuntaCofradia;
import com.semanasanta.backend.model.Procesion;
import com.semanasanta.backend.model.Recorrido;
import com.semanasanta.backend.security.UsuarioPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

// Utilidades compartidas por los tests unitarios de servicios:
// - Las entidades no tienen setId (lo asigna la base de datos), así que en
//   tests sin base de datos el id se fija por reflexión.
// - SecurityUtils.usuarioActual() lee el SecurityContext, que en producción
//   rellena JwtAuthenticationFilter; aquí se rellena a mano con autenticarComo.
public final class DatosPrueba {

    private DatosPrueba() {
    }

    public static <T> T conId(T entidad, Long id) {
        ReflectionTestUtils.setField(entidad, "id", id);
        return entidad;
    }

    public static void autenticarComo(Long id, String rol) {
        UsuarioPrincipal principal = new UsuarioPrincipal(id, rol);
        var autenticacion = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_" + rol)));
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
    }

    // Cofrade: el JWT lleva además el código de acceso con el que entró
    // (ver UsuarioPrincipal.codigoId).
    public static void autenticarComoCofrade(Long cofradiaId, Long codigoId) {
        UsuarioPrincipal principal = new UsuarioPrincipal(cofradiaId, "COFRADE", codigoId);
        var autenticacion = new UsernamePasswordAuthenticationToken(
                principal, null, List.of(new SimpleGrantedAuthority("ROLE_COFRADE")));
        SecurityContextHolder.getContext().setAuthentication(autenticacion);
    }

    public static void cerrarSesion() {
        SecurityContextHolder.clearContext();
    }

    public static Ciudad ciudad(Long id) {
        return conId(new Ciudad("Ciudad " + id, "Castilla y León", "Valladolid", null, null, 41.65, -4.72), id);
    }

    public static Cofradia cofradia(Long id, Ciudad ciudad) {
        return conId(new Cofradia("Cofradía " + id, null, null, null, LocalDateTime.now(), ciudad), id);
    }

    public static JuntaCofradias junta(Long id, Ciudad ciudad) {
        return conId(new JuntaCofradias("Junta " + id, "junta" + id + "@test.es", null, ciudad), id);
    }

    public static MiembroJuntaCofradia miembro(Long id, JuntaCofradias junta) {
        return conId(new MiembroJuntaCofradia("Miembro " + id, "miembro" + id + "@test.es", null, "hash", junta), id);
    }

    public static Administrador administrador(Long id) {
        return conId(new Administrador("admin" + id + "@test.es", "hash"), id);
    }

    public static Recorrido recorrido(Long id) {
        return conId(new Recorrido(1.0, 60), id);
    }

    public static Procesion procesion(Long id, Cofradia cofradia, Recorrido recorrido) {
        LocalDateTime inicio = LocalDateTime.now().plusDays(1);
        Procesion procesion = new Procesion("Procesión " + id, null, null, inicio, null, null,
                inicio, inicio.plusHours(3), recorrido);
        procesion.addCofradia(cofradia);
        return conId(procesion, id);
    }
}
