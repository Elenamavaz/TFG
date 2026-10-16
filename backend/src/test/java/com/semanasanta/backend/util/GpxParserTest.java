package com.semanasanta.backend.util;

import com.semanasanta.backend.exception.ArchivoInvalidoException;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Pruebas unitarias de GpxParser: no necesitan Spring ni base de datos, solo
// un GPX escrito a mano como String.
class GpxParserTest {

    private static InputStream gpx(String cuerpo) {
        String xml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<gpx version=\"1.1\" creator=\"test\" xmlns=\"http://www.topografix.com/GPX/1/1\">"
                + cuerpo
                + "</gpx>";
        return new ByteArrayInputStream(xml.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void leeLosPuntosDelTrackEnOrden() {
        List<GpxParser.Punto> puntos = GpxParser.extraerPuntos(gpx(
                "<trk><trkseg>"
                        + "<trkpt lat=\"41.65\" lon=\"-4.72\"/>"
                        + "<trkpt lat=\"41.66\" lon=\"-4.73\"/>"
                        + "<trkpt lat=\"41.67\" lon=\"-4.74\"/>"
                        + "</trkseg></trk>"));

        assertThat(puntos).containsExactly(
                new GpxParser.Punto(41.65, -4.72),
                new GpxParser.Punto(41.66, -4.73),
                new GpxParser.Punto(41.67, -4.74));
    }

    @Test
    void daPrioridadAlTrackSobreLaRutaYLosWaypoints() {
        List<GpxParser.Punto> puntos = GpxParser.extraerPuntos(gpx(
                "<wpt lat=\"1\" lon=\"1\"/><wpt lat=\"2\" lon=\"2\"/>"
                        + "<rte><rtept lat=\"3\" lon=\"3\"/><rtept lat=\"4\" lon=\"4\"/></rte>"
                        + "<trk><trkseg><trkpt lat=\"5\" lon=\"5\"/><trkpt lat=\"6\" lon=\"6\"/></trkseg></trk>"));

        assertThat(puntos).containsExactly(new GpxParser.Punto(5, 5), new GpxParser.Punto(6, 6));
    }

    @Test
    void sinTrackUsaLaRuta() {
        List<GpxParser.Punto> puntos = GpxParser.extraerPuntos(gpx(
                "<wpt lat=\"1\" lon=\"1\"/><wpt lat=\"2\" lon=\"2\"/>"
                        + "<rte><rtept lat=\"3\" lon=\"3\"/><rtept lat=\"4\" lon=\"4\"/></rte>"));

        assertThat(puntos).containsExactly(new GpxParser.Punto(3, 3), new GpxParser.Punto(4, 4));
    }

    @Test
    void sinTrackNiRutaUsaLosWaypoints() {
        List<GpxParser.Punto> puntos = GpxParser.extraerPuntos(gpx(
                "<wpt lat=\"1\" lon=\"1\"/><wpt lat=\"2\" lon=\"2\"/>"));

        assertThat(puntos).containsExactly(new GpxParser.Punto(1, 1), new GpxParser.Punto(2, 2));
    }

    @Test
    void ignoraPuntosConCoordenadasInvalidas() {
        List<GpxParser.Punto> puntos = GpxParser.extraerPuntos(gpx(
                "<trk><trkseg>"
                        + "<trkpt lat=\"41.65\" lon=\"-4.72\"/>"
                        + "<trkpt lat=\"abc\" lon=\"-4.73\"/>"
                        + "<trkpt lon=\"-4.73\"/>"
                        + "<trkpt lat=\"41.67\" lon=\"-4.74\"/>"
                        + "</trkseg></trk>"));

        assertThat(puntos).hasSize(2);
    }

    @Test
    void muestreaATrescientosPuntosConservandoPrimeroYUltimo() {
        StringBuilder trk = new StringBuilder("<trk><trkseg>");
        for (int i = 0; i < 1000; i++) {
            trk.append("<trkpt lat=\"").append(i).append("\" lon=\"0\"/>");
        }
        trk.append("</trkseg></trk>");

        List<GpxParser.Punto> puntos = GpxParser.extraerPuntos(gpx(trk.toString()));

        assertThat(puntos).hasSize(300);
        assertThat(puntos.get(0).latitud()).isEqualTo(0);
        assertThat(puntos.get(299).latitud()).isEqualTo(999);
    }

    @Test
    void rechazaUnGpxConMenosDeDosPuntos() {
        assertThatThrownBy(() -> GpxParser.extraerPuntos(gpx(
                "<trk><trkseg><trkpt lat=\"41.65\" lon=\"-4.72\"/></trkseg></trk>")))
                .isInstanceOf(ArchivoInvalidoException.class)
                .hasMessageContaining("al menos 2");
    }

    @Test
    void rechazaUnArchivoQueNoEsXml() {
        InputStream noXml = new ByteArrayInputStream("esto no es un gpx".getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> GpxParser.extraerPuntos(noXml))
                .isInstanceOf(ArchivoInvalidoException.class)
                .hasMessageContaining("no es un GPX válido");
    }

    @Test
    void rechazaDoctypeParaEvitarXxe() {
        String xxe = "<?xml version=\"1.0\"?>"
                + "<!DOCTYPE gpx [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>"
                + "<gpx><wpt lat=\"1\" lon=\"1\"><name>&xxe;</name></wpt><wpt lat=\"2\" lon=\"2\"/></gpx>";
        InputStream entrada = new ByteArrayInputStream(xxe.getBytes(StandardCharsets.UTF_8));

        assertThatThrownBy(() -> GpxParser.extraerPuntos(entrada))
                .isInstanceOf(ArchivoInvalidoException.class);
    }
}
