package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.10 del Apéndice C: notificaciones.
// Decisión de implementación (2026-08-20, revierte la del 2026-08-14):
// clase única, sin jerarquía Aviso/Alerta. El Apéndice C ya modelaba esto
// como una sola tabla con columna "tipo" ENUM(AVISO/ALERTA) + columnas
// nullable solo-Aviso/solo-Alerta; se había cambiado a herencia real JOINED
// (como Evento/Procesion) pero la diferencia entre los dos subtipos era
// mínima (fechaExpiracion vs tipoAlerta+prioridad) y esa herencia ya costó un
// bug real de Hibernate (proxy JOINED sin unproxy, ver memoria del TFG). Al
// revisar qué tipos de alerta se usaban de verdad se vio además que el
// cliente decide el color de la tarjeta solo por prioridad, nunca por
// tipoAlerta (Alerta.js) -esa distinción tan fina no se estaba ganando su
// sitio-, así que se colapsa todo en una tabla con columnas nullable según
// el caso, más simple de mantener.
//
// mensaje: nuevo (no existía ni como Aviso.texto ni en ningún sitio) -- la
// razón de una incidencia/cambio de horario/cancelación va aquí como texto
// libre, en vez de necesitar una categoría de TipoNotificacion propia para
// cada motivo (corte de calle, meteorología...).
//
// tipo/prioridad: tipo es obligatorio siempre. prioridad es nullable -solo
// la exige NotificacionService.crear() cuando tipo no es INICIO/FIN (esos
// dos los genera el sistema, sin prioridad que asignar). fechaExpiracion es
// opcional para cualquier tipo, ya no exclusiva de lo que antes era Aviso.
//
// ciudad_id: hueco no cubierto en el Apéndice C (igual que eventos.ubicacion_id
// en su momento) -- sin una ciudad a la que pertenecer, el ciudadano no
// tendría forma de filtrar "las notificaciones de MI ciudad", y la Junta que
// puede crearlas no tendría ámbito que comprobar (mismo patrón de propiedad
// que Cofradia/Paso/Evento).
@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ciudad_id", nullable = false)
    private Ciudad ciudad;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoNotificacion tipo;

    @Enumerated(EnumType.STRING)
    private Prioridad prioridad;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    protected Notificacion() {
    }

    public Notificacion(String titulo, String mensaje, Ciudad ciudad, TipoNotificacion tipo, Prioridad prioridad,
                         LocalDateTime fechaExpiracion) {
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.ciudad = ciudad;
        this.tipo = tipo;
        this.prioridad = prioridad;
        this.fechaExpiracion = fechaExpiracion;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getMensaje() {
        return mensaje;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public Ciudad getCiudad() {
        return ciudad;
    }

    public TipoNotificacion getTipo() {
        return tipo;
    }

    public Prioridad getPrioridad() {
        return prioridad;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    // Sin setters: una notificación ya enviada no se edita (igual que
    // PosicionActual), solo se puede borrar (retractarla) -- ver
    // NotificacionService.eliminar.
}
