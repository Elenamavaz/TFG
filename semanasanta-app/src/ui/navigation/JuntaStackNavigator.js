import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PerfilJuntaScreen,
  EditarPerfilJuntaScreen,
  ProcesionesScreen,
  FormularioProcesionScreen,
  ProcesionCreadaScreen,
  ProcesionActualizadaScreen,
} from '../screens/junta';
import { colors, fontFamilies } from '../../theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: fontFamilies.titleSemiBold, fontSize: 18 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

// Flujo propio del rol Junta (mockup del 2026-08-18): RootNavigator entra
// aquí directamente en cuanto detecta una sesión con rol JUNTA activa (si
// está desactivada, va a CuentaDesactivada en su lugar) -antes de esto era
// PanelProximamenteScreen, ya no existe. Perfil + Editar perfil + Procesiones
// (mockup del 2026-08-20) ya completos; Cofradías/Eventos/Pasos siguen
// aplazados -mismo criterio que el resto del panel, no se construye una
// sección sin sus propios mockups de alta/edición. Sin barra de pestañas
// inferior a propósito, igual que AdministradorStackNavigator.
export function JuntaStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PerfilJunta" component={PerfilJuntaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditarPerfilJunta" component={EditarPerfilJuntaScreen} />
      <Stack.Screen name="Procesiones" component={ProcesionesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FormularioProcesion" component={FormularioProcesionScreen} />
      <Stack.Screen name="ProcesionCreada" component={ProcesionCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProcesionActualizada" component={ProcesionActualizadaScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
