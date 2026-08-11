package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Tabla C.5 del Apéndice C: codigos_acceso.
// "Códigos que emite la Junta de cofradias." Quien lo valida obtiene un JWT con rol
// Cofrade (Sección AuthService), sin que eso registre a nadie -decisión del
// 2026-08-11, ver PosicionActual.
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

    protected CodigoAcceso() {
    }

    public CodigoAcceso(String codigo, Cofradia cofradia) {
        this.codigo = codigo;
        this.cofradia = cofradia;
        this.estado = EstadoCodigo.EMITIDO; // todo código nace EMITIDO
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
}
