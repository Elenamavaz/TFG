import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PerfilJuntaScreen, EditarPerfilJuntaScreen } from '../screens/junta';
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
// PanelProximamenteScreen, ya no existe. Solo Perfil + Editar perfil por
// ahora: Cofradías/Procesiones/Eventos/Pasos son la lista de "Gestión" del
// mockup, pero sin pantallas propias de alta/edición todavía -mismo
// criterio que el resto del panel Admin, no se construye una sección a
// medias, ver memoria del TFG. Sin barra de pestañas inferior a propósito,
// igual que AdministradorStackNavigator.
export function JuntaStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PerfilJunta" component={PerfilJuntaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditarPerfilJunta" component={EditarPerfilJuntaScreen} />
    </Stack.Navigator>
  );
}
