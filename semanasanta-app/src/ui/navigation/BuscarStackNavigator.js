import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BuscarScreen,
  DetalleCofradiaScreen,
  DetallePasoScreen,
  DetalleProcesionScreen,
  DetalleProcesionInfoScreen,
  DetalleEventoScreen,
} from '../screens/ciudadano';
import { colors, fontFamilies } from '../../theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: fontFamilies.titleSemiBold, fontSize: 18 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export function BuscarStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BuscarHome" component={BuscarScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleCofradia" component={DetalleCofradiaScreen} options={{ title: '' }} />
      <Stack.Screen name="DetallePaso" component={DetallePasoScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleProcesion" component={DetalleProcesionScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleProcesionInfo" component={DetalleProcesionInfoScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleEvento" component={DetalleEventoScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
