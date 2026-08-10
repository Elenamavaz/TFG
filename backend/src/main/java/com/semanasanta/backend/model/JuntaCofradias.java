package com.semanasanta.backend.model;

import jakarta.persistence.*;

// Tabla C.2 del Apéndice C: juntas_cofradias.
// "Junta que gestiona una ciudad. Relación 1:1 con ciudades" (Requisito RI-10).
//
// Se modela con @ManyToOne + columna UNIQUE en vez de @OneToOne: es la forma
// recomendada de hacer 1:1 en JPA (evita los problemas conocidos de @OneToOne
// con la carga lazy del lado propietario), y la propia base de datos garantiza
// con la restricción UNIQUE que no puede haber dos juntas para la misma ciudad.
@Entity
@Table(name = "juntas_cofradias")
public class JuntaCofradias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private String email;

    private String telefono;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ciudad_id", nullable = false, unique = true)
    private Ciudad ciudad;

    protected JuntaCofradias() {
    }

    public JuntaCofradias(String nombre, String email, String telefono, Ciudad ciudad) {
        this.nombre = nombre;
        this.email = email;
        this.telefono = telefono;
        this.ciudad = ciudad;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public Ciudad getCiudad() {
        return ciudad;
    }

    public void setCiudad(Ciudad ciudad) {
        this.ciudad = ciudad;
    }
}
