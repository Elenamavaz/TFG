import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { services } from '../../../data';
import { geo } from '../../utils';
import { colors } from '../../../theme';
import { estiloMapaOscuro } from './estiloMapa';
import { MarcadoresInicioFin } from './MarcadoresInicioFin';
import { styles } from './mapas.styles';

const INTERVALO_REFRESCO_MS = 15000;
const MARGEN_ENCUADRE = { top: 40, right: 40, bottom: 40, left: 40 };

// Mapa pequeño del recorrido de una procesión, para su pantalla de detalle
// (2026-10-04, mockup de Elena: en vez de la lista de puntos). Ruta en
// blanco encuadrada entera; si la procesión está en curso, además la
// estela verde (tramo ocupado ahora, ver getEstelaProcesion), un punto en
// la cabeza y la píldora "En curso", refrescados cada 15 s.
//
// "puntos" son los PuntoDeInteres del Recorrido (con latitud/longitud).
// Solo Android/iOS; en web se usa MapaRecorrido.js.
export function MapaRecorrido({ puntos, procesionId, enCurso }) {
  const mapaRef = useRef(null);
  const [estela, setEstela] = useState(null);
  const [ancho, setAncho] = useState(null); // ver comentario en el render

  const coordenadas = puntos
    .filter((p) => p.latitud != null && p.longitud != null)
    .map((p) => ({ latitude: p.latitud, longitude: p.longitud }));

  useEffect(() => {
    if (!enCurso) return undefined;
    const cargar = () =>
      services.getEstelaProcesion(procesionId)
        .then(setEstela)
        .catch(() => {});
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, [enCurso, procesionId]);

  function encuadrar() {
    if (coordenadas.length > 1) {
      mapaRef.current?.fitToCoordinates(coordenadas, {
        edgePadding: MARGEN_ENCUADRE,
        animated: false,
      });
    }
  }

  if (coordenadas.length < 2) return null;

  const tramo = estela ? geo.tramoDeRecorrido(coordenadas, estela.progresoCola, estela.progresoCabeza) : [];
  const cabeza = estela ? geo.puntoEnFraccion(coordenadas, estela.progresoCabeza) : null;

  return (
    // Tamaño exacto en píxeles medido de la tarjeta (onLayout): si el
    // MapView nativo calcula su propio tamaño en la nueva arquitectura, se
    // crea más alto de lo que se ve y la cámara queda descentrada.
    <View style={styles.tarjeta} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      {ancho ? (
        <MapView
          ref={mapaRef}
          style={{ ...styles.mapa, width: ancho }}
          provider={PROVIDER_GOOGLE}
          //customMapStyle={estiloMapaOscuro}
          initialRegion={{
            ...coordenadas[0],
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onMapReady={encuadrar}
          zoomControlEnabled
          toolbarEnabled={false}
        >
          <Polyline
            coordinates={coordenadas}
            strokeColor={colors.cream}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
          <MarcadoresInicioFin puntos={puntos} />
          {tramo.length > 1 ? (
            <Polyline
              coordinates={tramo}
              strokeColor={colors.lightGreenText}
              strokeWidth={5}
              lineCap="round"
              zIndex={2}
            />
          ) : null}
          {cabeza && enCurso ? (
            <Marker coordinate={cabeza} anchor={{ x: 0.5, y: 0.5 }} zIndex={3}>
              <View style={styles.puntoCabeza} />
            </Marker>
          ) : null}
        </MapView>
      ) : (
        <View style={styles.mapa} />
      )}
      {enCurso ? (
        <View style={styles.pildoraEnCurso}>
          <View style={styles.puntoVerde} />
          <Text style={styles.pildoraTexto}>En curso</Text>
        </View>
      ) : null}
    </View>
  );
}
