import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ScreenContainer } from '../components/common';
import { WelcomeScreen, LoginScreen } from '../screens/auth';
import { SeleccionCiudadScreen } from '../screens/ciudadano';
import { MainTabNavigator } from './MainTabNavigator';
import { useCiudad } from '../../application/context';
import { getModoAccesoGuardado } from '../../data/services';
import { resolverPantallaCiudadano } from '../utils/arranqueCiudadano';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator();

// Determina con qué pantalla arrancar la primera vez que se monta la app:
// - Si ya se entró antes como Ciudadano (modo guardado en el dispositivo), se
//   salta la Bienvenida y se resuelve la ciudad como siempre.
// - Si no hay nada guardado (primer arranque, o se entra como Junta/
//   Administrador, que sí requieren cuenta), se muestra la Bienvenida para elegir.
async function resolverArranque(seleccionarCiudad) {
  const modoAcceso = await getModoAccesoGuardado();
  if (modoAcceso === 'ciudadano') {
    return resolverPantallaCiudadano(seleccionarCiudad);
  }
  return 'Welcome';
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
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
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
