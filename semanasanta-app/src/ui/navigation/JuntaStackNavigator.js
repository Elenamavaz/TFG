import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { junta } from '../screens';
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
      <Stack.Screen name="PerfilJunta" component={junta.PerfilJuntaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditarPerfilJunta" component={junta.EditarPerfilJuntaScreen} />
      <Stack.Screen name="EditarInformacionCiudad" component={junta.EditarInformacionCiudadScreen} />
      {/* Sin headerShown: false (mismo bug ya corregido en
          AdministradorStackNavigator, 2026-08-21: apagaba la flecha de
          volver entera): cada lista pone su propio título por dentro con
          navigation.setOptions. */}
      <Stack.Screen name="Procesiones" component={junta.ProcesionesScreen} />
      <Stack.Screen name="FormularioProcesion" component={junta.FormularioProcesionScreen} />
      <Stack.Screen name="ProcesionCreada" component={junta.ProcesionCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProcesionActualizada" component={junta.ProcesionActualizadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SeleccionarPasos" component={junta.SeleccionarPasosScreen} />
      <Stack.Screen name="EditarRecorrido" component={junta.EditarRecorridoScreen} />

      <Stack.Screen name="Cofradias" component={junta.CofradiasScreen} />
      <Stack.Screen name="FormularioCofradia" component={junta.FormularioCofradiaScreen} />
      <Stack.Screen name="CofradiaCreada" component={junta.CofradiaCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CodigosAcceso" component={junta.CodigosAccesoScreen} />

      <Stack.Screen name="Eventos" component={junta.EventosScreen} />
      <Stack.Screen name="FormularioEvento" component={junta.FormularioEventoScreen} />
      <Stack.Screen name="EventoCreado" component={junta.EventoCreadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventoActualizado" component={junta.EventoActualizadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SeleccionarPasosEvento" component={junta.SeleccionarPasosEventoScreen} />

      <Stack.Screen name="Pasos" component={junta.PasosScreen} />
      <Stack.Screen name="FormularioPaso" component={junta.FormularioPasoScreen} />
      <Stack.Screen name="PasoCreado" component={junta.PasoCreadoScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PasoActualizado" component={junta.PasoActualizadoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
