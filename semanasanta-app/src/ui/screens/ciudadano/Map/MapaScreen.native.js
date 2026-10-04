import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { common } from '../../../components';
import { maps } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { geo } from '../../../utils';
import { colors } from '../../../../theme';
import { styles } from './MapaScreen.styles';

// Cada cuánto se refresca la posición de las procesiones mientras la
// pantalla está visible. Los cofrades mandan un ping cada 30s, así que 15s
// basta para que la estela se vea avanzar sin pedir de más.
const INTERVALO_REFRESCO_MS = 15000;

// Encuadre por defecto si la ciudad no tiene coordenadas: centro de España.
const REGION_ESPANA = { latitude: 40.2, longitude: -3.7, latitudeDelta: 8, longitudeDelta: 8 };
const MARGEN_ENCUADRE = { top: 60, right: 40, bottom: 60, left: 40 };

// Mapa en Vivo (2026-10-03, mockup de Elena): las procesiones EN_CURSO de la
// ciudad sobre Google Maps, cada una con su recorrido completo (gris), el
// tramo que ocupa ahora mismo (estela verde, de la cola a la cabeza, ver
// getEstelaProcesion) y un marcador con la cruz en la cabeza; más la
// ubicación del propio usuario. Debajo, "En movimiento": una tarjeta por
// procesión que centra el mapa en ella.
//
// Solo Android/iOS: react-native-maps no funciona en web, así que en el
// navegador se usa MapaScreen.js (aviso) -Metro elige este archivo .native
// automáticamente en el móvil.
export function MapaScreen({ route }) {
  const { ciudadSeleccionada } = context.useCiudad();
  const mapaRef = useRef(null);
  // Los recorridos no cambian mientras la procesión está en curso: se piden
  // una vez y se guardan aquí, y el refresco periódico solo pide la estela.
  const recorridosRef = useRef({});
  const [enMovimiento, setEnMovimiento] = useState([]);
  const [cargado, setCargado] = useState(false);
  const [permisoUbicacion, setPermisoUbicacion] = useState(false);
  // Tamaño exacto del mapa en píxeles, medido de la tarjeta (ver
  // components/maps/mapas.styles: con flex el mapa nativo se crea más alto
  // de lo visible y la cámara queda descentrada).
  const [tamanoMapa, setTamanoMapa] = useState(null);
  const procesionAEnfocar = route?.params?.procesionId ?? null;

  const ciudadId = ciudadSeleccionada?.id;

  const cargar = useCallback(async () => {
    if (!ciudadId) return;
    try {
      const procesiones = (await services.getProcesionesPorCiudad(ciudadId)).filter((p) => p.estado === 'EN_CURSO');
      const items = await Promise.all(
        procesiones.map(async (procesion) => {
          const recorrido = procesion.recorridoId ? await obtenerRecorrido(procesion.recorridoId) : null;
          const estela = await services.getEstelaProcesion(procesion.id).catch(() => null);
          return construirItem(procesion, recorrido, estela);
        }),
      );
      setEnMovimiento(items);
    } catch {
      // Sin red un momento: se mantiene lo último pintado y se reintenta en
      // el siguiente ciclo.
    } finally {
      setCargado(true);
    }
  }, [ciudadId]);

  async function obtenerRecorrido(recorridoId) {
    if (!recorridosRef.current[recorridoId]) {
      const recorrido = await services.getRecorridoCompleto(recorridoId);
      const puntos = recorrido.puntos
        .filter((p) => p.latitud != null && p.longitud != null)
        .map((p) => ({ latitude: p.latitud, longitude: p.longitud }));
      const nombres = recorrido.puntos.filter((p) => p.nombre).map((p) => p.nombre);
      // puntosRuta: los PuntoDeInteres originales (con nombre), para marcar
      // inicio y fin (ver MarcadoresInicioFin).
      recorridosRef.current[recorridoId] = { puntos, puntosRuta: recorrido.puntos, resumen: nombres.join(' → ') };
    }
    return recorridosRef.current[recorridoId];
  }

  useFocusEffect(
    useCallback(() => {
      cargar();
      const intervalo = setInterval(cargar, INTERVALO_REFRESCO_MS);
      return () => clearInterval(intervalo);
    }, [cargar]),
  );

  useEffect(() => {
    services.solicitarPermisoUbicacion().then(setPermisoUbicacion);
  }, []);

  // Llegando desde "Ir a la procesión" (DetailProcesionScreen): centrar en
  // ella en cuanto esté cargada.
  useEffect(() => {
    if (!procesionAEnfocar) return;
    const item = enMovimiento.find((i) => i.id === procesionAEnfocar);
    if (item) centrarEn(item);
  }, [procesionAEnfocar, enMovimiento.length]);

  function centrarEn(item) {
    const coordenadas = item.estela.length > 1 ? item.estela : item.puntos;
    if (coordenadas.length > 1) {
      mapaRef.current?.fitToCoordinates(coordenadas, { edgePadding: MARGEN_ENCUADRE, animated: true });
    } else if (item.cabeza) {
      mapaRef.current?.animateToRegion({ ...item.cabeza, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 500);
    }
  }

  const regionInicial =
    ciudadSeleccionada?.latitud != null && ciudadSeleccionada?.longitud != null
      ? {
          latitude: ciudadSeleccionada.latitud,
          longitude: ciudadSeleccionada.longitud,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        }
      : REGION_ESPANA;

  return (
    <common.ScreenContainer style={styles.pantalla}>
      <Text style={styles.title}>Mapa en Vivo</Text>
      <Text style={styles.subtitle}>
        {ciudadSeleccionada ? `${ciudadSeleccionada.nombre} · Tiempo real` : 'Tiempo real'}
      </Text>

      <View
        style={styles.mapaCard}
        onLayout={(e) => setTamanoMapa({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
      >
        {tamanoMapa ? (
          <MapView
            ref={mapaRef}
            style={tamanoMapa}
            provider={PROVIDER_GOOGLE}
            customMapStyle={maps.estiloMapaOscuro}
            initialRegion={regionInicial}
            showsUserLocation={permisoUbicacion}
            showsMyLocationButton={false}
            toolbarEnabled={false}
          >
            {enMovimiento.map((item) => (
              <MarcasProcesion key={item.id} item={item} />
            ))}
          </MapView>
        ) : null}

        {enMovimiento.length > 0 ? (
          <View style={styles.pildoraEnCurso}>
            <View style={styles.puntoVerde} />
            <Text style={styles.pildoraTexto}>En curso</Text>
          </View>
        ) : null}

        <View style={styles.leyenda}>
          <View style={styles.leyendaFila}>
            <View style={styles.puntoVerde} />
            <Text style={styles.leyendaTexto}>Procesión en curso</Text>
          </View>
          <View style={styles.leyendaFila}>
            <View style={styles.puntoAzul} />
            <Text style={styles.leyendaTexto}>Tu ubicación</Text>
          </View>
        </View>
      </View>

      {/* "En movimiento" siempre visible bajo el mapa (mockup); sin
          procesiones en curso, una tarjeta con el aviso en vez de la lista. */}
      <Text style={styles.sectionTitle}>En movimiento</Text>
      {cargado && enMovimiento.length === 0 ? (
        <View style={styles.vacioCard}>
          <View style={styles.puntoGrisGrande} />
          <Text style={styles.vacioTexto}>No hay ninguna procesión en curso ahora mismo</Text>
        </View>
      ) : (
        <ScrollView style={styles.lista} contentContainerStyle={styles.listaContenido}>
          {enMovimiento.map((item) => (
            <common.ProcesionCardMap
              key={item.id}
              titulo={item.nombre}
              ruta={item.resumen || (item.puntos.length ? 'Recorrido sin puntos destacados' : 'Sin recorrido definido')}
              estado={item.estado}
              onPress={() => centrarEn(item)}
            />
          ))}
        </ScrollView>
      )}
    </common.ScreenContainer>
  );
}

// Lo que se pinta de cada procesión: recorrido completo (gris), estela
// (verde) y marcadores de cola (punto pequeño) y cabeza (cruz).
function MarcasProcesion({ item }) {
  return (
    <>
      {item.puntos.length > 1 ? (
        <Polyline
          coordinates={item.puntos}
          strokeColor={colors.rutaMapa}
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
      ) : null}
      <maps.MarcadoresInicioFin puntos={item.puntosRuta} />
      {item.estela.length > 1 ? (
        <Polyline
          coordinates={item.estela}
          strokeColor={colors.lightGreenBackground}
          strokeWidth={6}
          lineCap="round"
          zIndex={2}
        />
      ) : null}
      {item.cola && item.estela.length > 1 ? (
        <Marker coordinate={item.cola} anchor={{ x: 0.5, y: 0.5 }} zIndex={3}>
          <View style={styles.marcadorCola} />
        </Marker>
      ) : null}
      {item.cabeza ? (
        <Marker coordinate={item.cabeza} anchor={{ x: 0.5, y: 0.5 }} title={item.nombre} zIndex={4}>
          <View style={styles.marcadorCabeza}>
            <MaterialCommunityIcons name="cross" size={16} color={colors.cream} />
          </View>
        </Marker>
      ) : null}
    </>
  );
}

// Junta procesión + recorrido + estela en lo que necesita el mapa. Sin pings
// todavía (estela a 0/0), la cruz se pone al inicio del recorrido: la
// procesión está en curso pero aún no hay cofrades compartiendo.
function construirItem(procesion, recorrido, estela) {
  const puntos = recorrido?.puntos ?? [];
  const cola = estela?.progresoCola ?? 0;
  const cabeza = estela?.progresoCabeza ?? 0;
  return {
    id: procesion.id,
    nombre: procesion.nombre,
    estado: procesion.estado,
    resumen: recorrido?.resumen ?? '',
    puntos,
    puntosRuta: recorrido?.puntosRuta ?? [],
    estela: geo.tramoDeRecorrido(puntos, cola, cabeza),
    cola: geo.puntoEnFraccion(puntos, cola),
    cabeza: geo.puntoEnFraccion(puntos, cabeza),
  };
}
