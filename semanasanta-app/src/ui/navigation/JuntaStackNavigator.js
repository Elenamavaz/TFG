import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PerfilJuntaScreen,
  EditarPerfilJuntaScreen,
  ProcesionesScreen,
  FormularioProcesionScreen,
  ProcesionCreadaScreen,
  ProcesionActualizadaScreen,
  SeleccionarPasosScreen,
  CofradiasScreen,
  FormularioCofradiaScreen,
  CofradiaCreadaScreen,
  EventosScreen,
  FormularioEventoScreen,
  EventoCreadoScreen,
  EventoActualizadoScreen,
  SeleccionarPasosEventoScreen,
  PasosScreen,
  FormularioPasoScreen,
  PasoCreadoScreen,
  PasoActualizadoScreen,
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

// Flujo propio del rol Junta: RootNavigator entra aquí directamente en
// cuanto detecta una sesión con rol JUNTA activa (si está desactivada, va a
// CuentaDesactivada en su lugar). Perfil + Editar perfil + Procesiones
// (mockup del 2026-08-20), y desde el 2026-08-22 también Cofradías/Eventos/
// Pasos (con sus propios mockups de alta/edición ya recibidos -antes
// quedaban aplazados por el mismo criterio que el resto del panel). Sin
// barra de pestañas inferior a propósito, igual que AdministradorStackNavigator.
export function JuntaStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PerfilJunta" component={PerfilJuntaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditarPerfilJunta" component={EditarPerfilJuntaScreen} />
      {/* Sin headerShown: false (mismo bug ya corregido en
          AdministradorStackNavigator, 2026-08-21: apagaba la flecha de
          volver entera): cada lista pone su propio título por dentro con
          navigation.setOptions. */}
      <Stack.Screen name="Procesiones" component={ProcesionesScreen} />
      <Stack.Screen name="FormularioProcesion" component={FormularioProcesionScreen} />
      <Stack.Screen name="ProcesionCreada" component={ProcesionCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProcesionActualizada" component={ProcesionActualizadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SeleccionarPasos" component={SeleccionarPasosScreen} />

      <Stack.Screen name="Cofradias" component={CofradiasScreen} />
      <Stack.Screen name="FormularioCofradia" component={FormularioCofradiaScreen} />
      <Stack.Screen name="CofradiaCreada" component={CofradiaCreadaScreen} options={{ headerShown: false }} />

      <Stack.Screen name="Eventos" component={EventosScreen} />
      <Stack.Screen name="FormularioEvento" component={FormularioEventoScreen} />
      <Stack.Screen name="EventoCreado" component={EventoCreadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventoActualizado" component={EventoActualizadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SeleccionarPasosEvento" component={SeleccionarPasosEventoScreen} />

      <Stack.Screen name="Pasos" component={PasosScreen} />
      <Stack.Screen name="FormularioPaso" component={FormularioPasoScreen} />
      <Stack.Screen name="PasoCreado" component={PasoCreadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PasoActualizado" component={PasoActualizadoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
