package com.semanasanta.backend.util;

import com.semanasanta.backend.exception.ArchivoInvalidoException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

// Lee un archivo GPX (formato estándar que exportan gpx.studio, Wikiloc,
// Strava, Google My Maps...) y saca los puntos del recorrido EN ORDEN -esa
// es la pieza que resuelve RecorridoService.importarGpx: pedir el orden a
// mano en la app (arrastrando puntos en un mapa) está fuera del alcance
// razonable del TFG, así que se delega en una app externa para dibujar la
// ruta y aquí solo se lee el resultado.
//
// Prioridad si el archivo trae varias cosas a la vez (algunos exportadores
// meten track Y route): <trk>/<trkseg>/<trkpt> primero (lo que graba un GPS
// real, o lo que exportan la mayoría de editores), si no hay, <rte>/<rtept>
// (ruta planificada a mano), si no hay, <wpt> sueltos como último recurso.
// No se usa ninguna librería GPX de terceros -parsing XML manual con el DOM
// del propio JDK, de sobra para leer lat/lon en orden de aparición.
public final class GpxParser {

    // Un track grabado caminando la ruta real puede traer miles de puntos
    // (uno cada pocos segundos) -guardar cada uno como fila de puntos_ruta
    // sería excesivo para lo que hace falta (solo pintar la línea en el
    // mapa). Si hay más de esto, se muestrea de forma uniforme conservando
    // siempre el primero y el último.
    private static final int MAX_PUNTOS = 300;

    private GpxParser() {
    }

    public record Punto(double latitud, double longitud) {
    }

    public static List<Punto> extraerPuntos(InputStream gpx) {
        Document documento = parsearXml(gpx);

        List<Punto> puntos = leerPuntos(documento, "trkpt");
        if (puntos.isEmpty()) {
            puntos = leerPuntos(documento, "rtept");
        }
        if (puntos.isEmpty()) {
            puntos = leerPuntos(documento, "wpt");
        }
        if (puntos.size() < 2) {
            throw new ArchivoInvalidoException(
                    "El archivo GPX no tiene suficientes puntos de recorrido (se necesitan al menos 2)");
        }

        return muestrear(puntos);
    }

    private static Document parsearXml(InputStream gpx) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            // Sin resolución de entidades externas ni DOCTYPE: un GPX nunca
            // los necesita, y admitirlos abriría la puerta a XXE en un
            // archivo que sube directamente el usuario.
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            factory.setExpandEntityReferences(false);
            DocumentBuilder builder = factory.newDocumentBuilder();
            return builder.parse(gpx);
        } catch (Exception ex) {
            throw new ArchivoInvalidoException("El archivo no es un GPX válido: " + ex.getMessage());
        }
    }

    private static List<Punto> leerPuntos(Document documento, String etiqueta) {
        List<Punto> puntos = new ArrayList<>();
        NodeList nodos = documento.getElementsByTagName(etiqueta);
        for (int i = 0; i < nodos.getLength(); i++) {
            Element elemento = (Element) nodos.item(i);
            try {
                double latitud = Double.parseDouble(elemento.getAttribute("lat"));
                double longitud = Double.parseDouble(elemento.getAttribute("lon"));
                puntos.add(new Punto(latitud, longitud));
            } catch (NumberFormatException ex) {
                // Punto sin lat/lon válidos (raro, pero un GPX mal exportado
                // podría traerlo): se ignora ese punto en vez de tirar todo
                // el archivo, el resto del recorrido sigue siendo útil.
            }
        }
        return puntos;
    }

    private static List<Punto> muestrear(List<Punto> puntos) {
        if (puntos.size() <= MAX_PUNTOS) {
            return puntos;
        }
        List<Punto> muestreados = new ArrayList<>(MAX_PUNTOS);
        double paso = (double) (puntos.size() - 1) / (MAX_PUNTOS - 1);
        for (int i = 0; i < MAX_PUNTOS; i++) {
            muestreados.add(puntos.get((int) Math.round(i * paso)));
        }
        return muestreados;
    }
}
