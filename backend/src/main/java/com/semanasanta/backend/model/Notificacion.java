package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.10 del Apéndice C: notificaciones.
// Decisión de implementación (2026-08-14, hueco marcado "pendiente" en la
// memoria): raíz abstracta de una jerarquía de herencia real (JOINED), igual
// que Evento/Procesion, PuntoRuta/PuntoDeInteres y Usuario. El Apéndice C
// modelaba el tipo con una columna "tipo" ENUM(AVISO/ALERTA) más columnas
// solo-Aviso/solo-Alerta sueltas en la misma tabla; aquí, como ya se ha hecho
// en el resto del esquema, se prefiere que sea la propia tabla de subtipo
// (Aviso/Alerta) la que dé el tipo, en vez de una columna nullable según el
// caso. Pendiente actualizar el texto del Apéndice C.
//
// ciudad_id: hueco no cubierto en el Apéndice C (igual que eventos.ubicacion_id
// en su momento) -- sin una ciudad a la que pertenecer, el ciudadano no
// tendría forma de filtrar "las notificaciones de MI ciudad", y la Junta que
// puede crearlas no tendría ámbito que comprobar (mismo patrón de propiedad
// que Cofradia/Paso/Evento).
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "notificaciones")
public abstract class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ciudad_id", nullable = false)
    private Ciudad ciudad;

    protected Notificacion() {
    }

    protected Notificacion(String titulo, Ciudad ciudad) {
        this.titulo = titulo;
        this.ciudad = ciudad;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public Ciudad getCiudad() {
        return ciudad;
    }

    // Sin setters: una notificación ya enviada no se edita (igual que
    // PosicionActual), solo se puede borrar (retractarla) -- ver
    // NotificacionService.eliminar.
}
