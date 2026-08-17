package com.semanasanta.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

// Tabla C.1 del Apéndice C de la memoria: ciudades.
// "Agrupa las procesiones y actos de cada localidad" (Requisitos RI-10, RI-09).
// Ampliada el 2026-08-16 con los campos que pide el mockup del panel de
// Administrador (provincia, patrimonio, activa); "descripcion" pasó a
// llamarse "historia" -mismo nombre que Cofradia/Paso/Evento para lo mismo,
// ver migración V25. "numCofradiasEstimado" se añadió y se quitó el mismo
// día (V25 luego V28): Elena decidió que no aportaba nada -el número real de
// cofradías ya se ve en vivo contando GET /cofradias?ciudadId=, un campo
// aparte solo podía quedar desactualizado.
@Entity
@Table(name = "ciudades")
public class Ciudad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(name = "comunidad_autonoma")
    private String comunidadAutonoma;

    private String provincia;

    @Column(columnDefinition = "TEXT")
    private String historia;

    @Column(columnDefinition = "TEXT")
    private String patrimonio;

    // Si el ciudadano la ve en el selector de ciudad (ver CiudadService.listar).
    // Nace siempre activa: no es algo que se elija al crearla, solo al editarla.
    @Column(nullable = false)
    private boolean activa;

    protected Ciudad() {
        // Constructor sin argumentos requerido por JPA.
    }

    public Ciudad(String nombre, String comunidadAutonoma, String provincia, String historia, String patrimonio) {
        this.nombre = nombre;
        this.comunidadAutonoma = comunidadAutonoma;
        this.provincia = provincia;
        this.historia = historia;
        this.patrimonio = patrimonio;
        this.activa = true;
    }

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getComunidadAutonoma() {
        return comunidadAutonoma;
    }

    public void setComunidadAutonoma(String comunidadAutonoma) {
        this.comunidadAutonoma = comunidadAutonoma;
    }

    public String getProvincia() {
        return provincia;
    }

    public void setProvincia(String provincia) {
        this.provincia = provincia;
    }

    public String getHistoria() {
        return historia;
    }

    public void setHistoria(String historia) {
        this.historia = historia;
    }

    public String getPatrimonio() {
        return patrimonio;
    }

    public void setPatrimonio(String patrimonio) {
        this.patrimonio = patrimonio;
    }

    public boolean isActiva() {
        return activa;
    }

    public void setActiva(boolean activa) {
        this.activa = activa;
    }
}
