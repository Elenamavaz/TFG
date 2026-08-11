package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Subtipo PuntoDeInteres del diagrama de dominio (Figura 3.5): un PuntoRuta
// "con detalle". Su id es a la vez PK y FK a puntos_ruta(id).
@Entity
@Table(name = "puntos_de_interes")
@PrimaryKeyJoinColumn(name = "id")
public class PuntoDeInteres extends PuntoRuta {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoPuntoInteres tipo;

    @Column(nullable = false)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String imagen;

    protected PuntoDeInteres() {
    }

    public PuntoDeInteres(TipoPuntoInteres tipo, String nombre, String descripcion, String imagen,
                           Ubicacion ubicacion) {
        super(ubicacion);
        this.tipo = tipo;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagen = imagen;
    }

    public TipoPuntoInteres getTipo() {
        return tipo;
    }

    public void setTipo(TipoPuntoInteres tipo) {
        this.tipo = tipo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagen() {
        return imagen;
    }

    public void setImagen(String imagen) {
        this.imagen = imagen;
    }
}
