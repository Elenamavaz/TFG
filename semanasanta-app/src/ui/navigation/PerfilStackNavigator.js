import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PerfilScreen,
  DetalleProcesionScreen,
  DetalleProcesionInfoScreen,
  DetallePasoScreen,
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

export function PerfilStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PerfilHome" component={PerfilScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetallePaso" component={DetallePasoScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleEvento" component={DetalleEventoScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleProcesion" component={DetalleProcesionScreen} options={{ title: '' }} />
      <Stack.Screen name="DetalleProcesionInfo" component={DetalleProcesionInfoScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
