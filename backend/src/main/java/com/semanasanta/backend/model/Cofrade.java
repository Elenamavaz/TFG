package com.semanasanta.backend.model;

// Cofrade del diagrama de dominio (Figura 3.5): SÍ existe como clase, pero a
// diferencia de MiembroJuntaCofradia/Administrador NO es un Usuario
// persistido, solo hacxe peticiones de ubicacion para esa procesion.
// compartiendoUbicacion es siempre true al construirse: solo se crea un
// Cofrade cuando está, precisamente, enviando un ping de ubicación (ver
// PosicionActualService) -no es un estado que se guarde entre peticiones,
// es un hecho de la petición actual.
public record Cofrade(Long cofradiaId, boolean compartiendoUbicacion) {

    public static Cofrade autenticado(Long cofradiaId) {
        return new Cofrade(cofradiaId, true);
    }
}
