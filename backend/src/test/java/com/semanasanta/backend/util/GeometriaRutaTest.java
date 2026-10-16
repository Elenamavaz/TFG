package com.semanasanta.backend.util;

import com.semanasanta.backend.util.GeometriaRuta.Proyeccion;
import com.semanasanta.backend.util.GeometriaRuta.PuntoGeo;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

// Pruebas unitarias de GeometriaRuta con un recorrido recto sobre el
// meridiano -4.72 (Valladolid): 0.001º de latitud son ~111 m, así que las
// distancias esperadas se pueden calcular a mano.
class GeometriaRutaTest {

    private static final double LON = -4.72;
    private static final double METROS_POR_MILESIMA_LAT = 111.2;

    // Recorrido recto de ~222 m hacia el norte en dos tramos iguales.
    private static final List<PuntoGeo> RUTA = List.of(
            new PuntoGeo(41.650, LON),
            new PuntoGeo(41.651, LON),
            new PuntoGeo(41.652, LON));

    @Test
    void puntoSobreElInicioTieneProgresoCero() {
        Proyeccion p = GeometriaRuta.proyectar(RUTA, 41.650, LON);

        assertThat(p.distanciaMetros()).isCloseTo(0, within(0.01));
        assertThat(p.progreso()).isCloseTo(0, within(0.001));
    }

    @Test
    void puntoEnMitadDelRecorridoTieneProgresoUnMedio() {
        Proyeccion p = GeometriaRuta.proyectar(RUTA, 41.651, LON);

        assertThat(p.distanciaMetros()).isCloseTo(0, within(0.01));
        assertThat(p.progreso()).isCloseTo(0.5, within(0.001));
    }

    @Test
    void puntoSobreElFinalTieneProgresoUno() {
        Proyeccion p = GeometriaRuta.proyectar(RUTA, 41.652, LON);

        assertThat(p.progreso()).isCloseTo(1, within(0.001));
    }

    @Test
    void calculaLaDistanciaPerpendicularAlRecorrido() {
        // 0.001º de longitud a esta latitud son ~83 m (111.2 * cos(41.65º)).
        double esperado = METROS_POR_MILESIMA_LAT * Math.cos(Math.toRadians(41.651));

        Proyeccion p = GeometriaRuta.proyectar(RUTA, 41.651, LON + 0.001);

        assertThat(p.distanciaMetros()).isCloseTo(esperado, within(1.0));
        assertThat(p.progreso()).isCloseTo(0.5, within(0.01));
    }

    @Test
    void puntoAntesDelInicioSeProyectaSobreElPrimerPunto() {
        Proyeccion p = GeometriaRuta.proyectar(RUTA, 41.649, LON);

        assertThat(p.distanciaMetros()).isCloseTo(METROS_POR_MILESIMA_LAT, within(1.0));
        assertThat(p.progreso()).isEqualTo(0);
    }

    @Test
    void puntoMasAllaDelFinalSeProyectaSobreElUltimoPunto() {
        Proyeccion p = GeometriaRuta.proyectar(RUTA, 41.653, LON);

        assertThat(p.distanciaMetros()).isCloseTo(METROS_POR_MILESIMA_LAT, within(1.0));
        assertThat(p.progreso()).isEqualTo(1);
    }

    @Test
    void conMenosDeDosPuntosDevuelveProyeccionNula() {
        assertThat(GeometriaRuta.proyectar(List.of(), 41.65, LON)).isEqualTo(new Proyeccion(0, 0));
        assertThat(GeometriaRuta.proyectar(List.of(new PuntoGeo(41.65, LON)), 41.66, LON))
                .isEqualTo(new Proyeccion(0, 0));
    }

    @Test
    void toleraTramosDegenerados() {
        List<PuntoGeo> conRepetido = List.of(
                new PuntoGeo(41.650, LON),
                new PuntoGeo(41.650, LON),
                new PuntoGeo(41.652, LON));

        Proyeccion p = GeometriaRuta.proyectar(conRepetido, 41.651, LON);

        assertThat(p.distanciaMetros()).isCloseTo(0, within(0.01));
        assertThat(p.progreso()).isCloseTo(0.5, within(0.001));
    }
}
