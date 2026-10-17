import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, View, Platform } from 'react-native';
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

function regionDeCiudad(ciudad) {
  return ciudad?.latitud != null && ciudad?.longitud != null
    ? { latitude: ciudad.latitud, longitude: ciudad.longitud, latitudeDelta: 0.03, longitudeDelta: 0.03 }
    : REGION_ESPANA;
}
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
  // Los recorridos no cambian mientras se mira el mapa: se piden una vez y
  // el refresco periódico solo pide la estela. La caché se vacía cada vez que
  // se vuelve a la pestaña (ver useFocusEffect): antes duraba para siempre y,
  // si la Junta reimportaba el GPX, seguía viéndose la ruta antigua (bug 21).
  const recorridosRef = useRef({});
  // Encuadrar todas las procesiones en curso la primera vez que se cargan
  // para cada ciudad, sin pelearse luego con lo que mueva el usuario.
  const encuadradoRef = useRef(false);
  const [enMovimiento, setEnMovimiento] = useState([]);
  const [cargado, setCargado] = useState(false);
  // Sin conexión (bug 27): no es lo mismo que "no hay ninguna en curso".
  const [errorCarga, setErrorCarga] = useState(null);
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
      const procesiones = await services.getProcesionesEnCurso(ciudadId);
      // Cada procesión por separado (bug 18): antes, si fallaba el recorrido
      // de una sola, Promise.all rechazaba y no se actualizaba ninguna.
      const items = await Promise.all(
        procesiones.map(async (procesion) => {
          const recorrido = procesion.recorridoId ? await obtenerRecorrido(procesion.recorridoId).catch(() => null) : null;
          const conRecorrido = (recorrido?.puntos.length ?? 0) > 1;
          // Con recorrido: la estela (tramo de la cola a la cabeza). Sin él:
          // al menos dónde están ahora sus cofrades (posición media).
          const estela = conRecorrido ? await services.getEstelaProcesion(procesion.id).catch(() => null) : null;
          const posicion = conRecorrido ? null : await services.getPosicionActualProcesion(procesion.id);
          return construirItem(procesion, recorrido, estela, posicion);
        }),
      );
      setEnMovimiento(items);
      setErrorCarga(null);
      if (!encuadradoRef.current && !procesionAEnfocar && items.length > 0) {
        encuadradoRef.current = encuadrarTodas(items);
      }
    } catch (err) {
      // Sin red un momento: se mantiene lo último pintado y se reintenta en
      // el siguiente ciclo (cada 15 s), pero se avisa de que no está al día.
      setErrorCarga(err.message);
    } finally {
      setCargado(true);
    }
  }, [ciudadId, procesionAEnfocar]);

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
      recorridosRef.current = {};
      cargar();
      const intervalo = setInterval(cargar, INTERVALO_REFRESCO_MS);
      return () => clearInterval(intervalo);
    }, [cargar]),
  );

  useEffect(() => {
    services.solicitarPermisoUbicacion().then(setPermisoUbicacion);
  }, []);

  // Cambio de ciudad con el mapa ya montado (las pestañas no se desmontan):
  // initialRegion solo se aplica la primera vez, así que hay que mover la
  // cámara a mano y olvidar lo de la ciudad anterior (bug 21).
  useEffect(() => {
    setEnMovimiento([]);
    setCargado(false);
    recorridosRef.current = {};
    encuadradoRef.current = false;
    mapaRef.current?.animateToRegion(regionDeCiudad(ciudadSeleccionada), 500);
  }, [ciudadId]);

  // Devuelve si ha podido encuadrar (hay coordenadas que mostrar).
  function encuadrarTodas(items) {
    const coordenadas = items.flatMap((item) => (item.puntos.length > 1 ? item.puntos : item.cabeza ? [item.cabeza] : []));
    if (coordenadas.length === 0) return false;
    if (coordenadas.length === 1) {
      mapaRef.current?.animateToRegion({ ...coordenadas[0], latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    } else {
      mapaRef.current?.fitToCoordinates(coordenadas, { edgePadding: MARGEN_ENCUADRE, animated: true });
    }
    return true;
  }

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

  const regionInicial = regionDeCiudad(ciudadSeleccionada);

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
            // Google Maps en Android; en iOS, Apple Maps (no necesita API key).
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            //customMapStyle={maps.estiloMapaOscuro}
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
      {errorCarga ? <common.AvisoError mensaje={errorCarga} onReintentar={cargar} /> : null}
      {cargado && enMovimiento.length === 0 && !errorCarga ? (
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
// Sin estela todavía (ningún ping), no se pinta cabeza ni cola: antes se
// ponían en el punto de salida como si la procesión ya estuviera allí.
function construirItem(procesion, recorrido, estela, posicion) {
  const puntos = recorrido?.puntos ?? [];
  const conEstela = estela != null && puntos.length > 1;
  return {
    id: procesion.id,
    nombre: procesion.nombre,
    estado: procesion.estado,
    resumen: recorrido?.resumen ?? '',
    puntos,
    puntosRuta: recorrido?.puntosRuta ?? [],
    estela: conEstela ? geo.tramoDeRecorrido(puntos, estela.progresoCola, estela.progresoCabeza) : [],
    cola: conEstela ? geo.puntoEnFraccion(puntos, estela.progresoCola) : null,
    cabeza: conEstela
      ? geo.puntoEnFraccion(puntos, estela.progresoCabeza)
      : posicion
        ? { latitude: posicion.latitude, longitude: posicion.longitude }
        : null,
  };
}
