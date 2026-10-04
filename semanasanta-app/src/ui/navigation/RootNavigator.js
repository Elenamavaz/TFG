import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { common } from '../components';
import { auth } from '../screens';
import { ciudadano } from '../screens';
import { MainTabNavigator } from './MainTabNavigator';
import { AdministradorStackNavigator } from './AdministradorStackNavigator';
import { JuntaStackNavigator } from './JuntaStackNavigator';
import { CofradeStackNavigator } from './CofradeStackNavigator';
import { context } from '../../application';
import { services } from '../../data';
import { arranqueCiudadano } from '../utils';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator();

// Determina con qué pantalla arrancar la primera vez que se monta la app:
// - Si ya hay una sesión de Administrador guardada (JWT, ver AuthContext), va
//   directa a su propio flujo (AdministradorStack).
// - Si hay sesión de Junta desactivada (sesion.activo === false, ver
//   AuthResponse del backend y LoginScreen), va directa al aviso de "cuenta
//   desactivada" -mismo destino al que ya la mandó el login.
// - Si hay sesión de Cofrade (código de acceso, 2026-10-03), va directa a su
//   propio panel (CofradeStack).
// - Si hay sesión de Junta activa, va directa a su propio flujo (JuntaStack).
// - Si no, y ya se entró antes como Ciudadano (modo guardado en el
//   dispositivo), se salta la Bienvenida y se resuelve la ciudad como siempre.
// - Si no hay nada guardado (primer arranque), se muestra la Bienvenida para elegir.
async function resolverArranque(seleccionarCiudad, sesion) {
  if (sesion?.rol === 'ADMIN') {
    return 'AdministradorStack';
  }
  if (sesion?.rol === 'COFRADE') {
    return 'CofradeStack';
  }
  if (sesion) {
    return sesion.activo === false ? 'CuentaDesactivada' : 'JuntaStack';
  }
  const modoAcceso = await services.getModoAccesoGuardado();
  if (modoAcceso === 'ciudadano') {
    return arranqueCiudadano.resolverPantallaCiudadano(seleccionarCiudad);
  }
  return 'Welcome';
}

export function RootNavigator() {
  const { seleccionarCiudad } = context.useCiudad();
  const { sesion, cargandoSesion } = context.useAuth();
  const [pantallaInicial, setPantallaInicial] = useState(null);

  useEffect(() => {
    if (cargandoSesion) return; // espera a que AuthContext termine de leer AsyncStorage
    let cancelado = false;
    resolverArranque(seleccionarCiudad, sesion).then((pantalla) => {
      if (!cancelado) setPantallaInicial(pantalla);
    });
    return () => {
      cancelado = true;
    };
  }, [cargandoSesion]);

  if (!pantallaInicial) {
    return (
      <common.ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </common.ScreenContainer>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={pantallaInicial}>
      <Stack.Screen name="Welcome" component={auth.WelcomeScreen} />
      <Stack.Screen name="Login" component={auth.LoginScreen} />
      <Stack.Screen name="CuentaDesactivada" component={auth.CuentaDesactivadaScreen} />
      <Stack.Screen name="AdministradorStack" component={AdministradorStackNavigator} />
      <Stack.Screen name="JuntaStack" component={JuntaStackNavigator} />
      <Stack.Screen name="CofradeStack" component={CofradeStackNavigator} />
      <Stack.Screen name="SeleccionCiudad" component={ciudadano.SeleccionCiudadScreen} />
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
