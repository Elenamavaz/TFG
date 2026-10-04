import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ciudadano } from '../screens';
import { colors } from '../../theme';
import { fontFamilies } from '../../theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: fontFamilies.titleSemiBold, fontSize: 18 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export function InicioStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="InicioHome" component={ciudadano.InicioScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Listado" component={ciudadano.ListadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleCiudad" component={ciudadano.DetalleCiudadScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleCofradia" component={ciudadano.DetalleCofradiaScreen} options={{ title: '' }} />
      <Stack.Screen name="DetallePaso" component={ciudadano.DetallePasoScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleProcesion" component={ciudadano.DetalleProcesionScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleProcesionInfo" component={ciudadano.DetalleProcesionInfoScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleEvento" component={ciudadano.DetalleEventoScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
