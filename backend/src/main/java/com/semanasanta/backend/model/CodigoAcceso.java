package com.semanasanta.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

// Tabla C.5 del Apéndice C: codigos_acceso.
// "Códigos que emite la Junta de cofradias." Quien lo valida obtiene un JWT con rol
// Cofrade (Sección AuthService), sin que eso registre a nadie -decisión del
// 2026-08-11, ver PosicionActual.
//
// Caducidad (2026-10-25, migración V44): cada código vale DURACION_HORAS
// desde que se emite. Pensado para el QR que la Junta pone en la iglesia el
// día de la procesión: al día siguiente ya no sirve, aunque alguien le haya
// hecho una foto. Se comprueba al iniciar sesión (AuthService) y en cada
// ping (PosicionActualService), igual que la revocación.
@Entity
@Table(name = "codigos_acceso")
public class CodigoAcceso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCodigo estado;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cofradia_id", nullable = false)
    private Cofradia cofradia;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    public static final long DURACION_HORAS = 24;

    protected CodigoAcceso() {
    }

    public CodigoAcceso(String codigo, Cofradia cofradia) {
        this.codigo = codigo;
        this.cofradia = cofradia;
        this.estado = EstadoCodigo.EMITIDO; // todo código nace EMITIDO
        this.fechaEmision = LocalDateTime.now();
        this.fechaExpiracion = fechaEmision.plusHours(DURACION_HORAS);
    }

    public boolean isCaducado() {
        return !LocalDateTime.now().isBefore(fechaExpiracion);
    }

    public Long getId() {
        return id;
    }

    public String getCodigo() {
        return codigo;
    }

    public EstadoCodigo getEstado() {
        return estado;
    }

    public void setEstado(EstadoCodigo estado) {
        this.estado = estado;
    }

    public Cofradia getCofradia() {
        return cofradia;
    }

    public LocalDateTime getFechaEmision() {
        return fechaEmision;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }
}
