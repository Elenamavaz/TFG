import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/common';
import { SeleccionCiudadScreen } from '../screens/ciudadano';
import { MainTabNavigator } from './MainTabNavigator';
import { useCiudad } from '../../application/context';
import {
  getCiudades,
  getCiudadIdGuardada,
  guardarCiudadId,
  solicitarPermisoUbicacion,
  obtenerPosicionActual,
} from '../../data/services';
import { ciudadMasCercana } from '../utils/geo';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator();

// Determina con qué pantalla arrancar la primera vez que se monta la app:
// - Si ya hay una ciudad guardada de una sesión anterior, se va directa a MainTabs.
// - Si no, se piden permisos de geolocalización; si se conceden, se preselecciona
//   la ciudad más cercana (y se guarda, para no volver a preguntar). Si se deniegan
//   (o falla la localización), se deja elegir a mano en SeleccionCiudadScreen.
async function resolverArranque(seleccionarCiudad) {
  const ciudades = await getCiudades();

  const ciudadIdGuardada = await getCiudadIdGuardada();
  const ciudadGuardada = ciudades.find((ciudad) => ciudad.id === ciudadIdGuardada);
  if (ciudadGuardada) {
    seleccionarCiudad(ciudadGuardada);
    return 'MainTabs';
  }

  const permisoConcedido = await solicitarPermisoUbicacion();
  if (permisoConcedido) {
    const posicion = await obtenerPosicionActual();
    const ciudadCercana = posicion ? ciudadMasCercana(ciudades, posicion.latitud, posicion.longitud) : null;
    if (ciudadCercana) {
      seleccionarCiudad(ciudadCercana);
      await guardarCiudadId(ciudadCercana.id);
      return 'MainTabs';
    }
  }

  return 'SeleccionCiudad';
}

export function RootNavigator() {
  const { seleccionarCiudad } = useCiudad();
  const [pantallaInicial, setPantallaInicial] = useState(null);

  useEffect(() => {
    let cancelado = false;
    resolverArranque(seleccionarCiudad).then((pantalla) => {
      if (!cancelado) setPantallaInicial(pantalla);
    });
    return () => {
      cancelado = true;
    };
  }, []);

  if (!pantallaInicial) {
    return (
      <ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </ScreenContainer>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={pantallaInicial}>
      <Stack.Screen name="SeleccionCiudad" component={SeleccionCiudadScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  cargando: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
