import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  PerfilAdministradorScreen,
  EditarPerfilScreen,
  CiudadesScreen,
  FormularioCiudadScreen,
  CiudadCreadaScreen,
  JuntasScreen,
  FormularioJuntaScreen,
  JuntaCreadaScreen,
  SolicitudesReactivacionScreen,
  MiembrosScreen,
  FormularioMiembroScreen,
  MiembroCreadoScreen,
} from '../screens/administrador';
import { colors, fontFamilies } from '../../theme';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: fontFamilies.titleSemiBold, fontSize: 18 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

// Flujo propio del rol Administrador (mockup del 2026-08-16): RootNavigator
// entra aquí directamente en cuanto detecta una sesión con rol ADMIN, sin
// pasar por MainTabs/PerfilStackNavigator (eso es solo para Ciudadano/
// Cofrade/Junta). Perfil + Ciudades + Juntas + Miembros (mockup del
// 2026-08-17, última pieza) ya completos. Deliberadamente sin barra de
// pestañas inferior (Elena, 2026-08-18: "si quieren consultar información
// como un ciudadano que cierren sesión y entren como ciudadano") -mismo
// criterio en JuntaStackNavigator.
export function AdministradorStackNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PerfilAdministrador" component={PerfilAdministradorScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditarPerfilAdministrador" component={EditarPerfilScreen} />
      <Stack.Screen name="Ciudades" component={CiudadesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FormularioCiudad" component={FormularioCiudadScreen} />
      <Stack.Screen name="CiudadCreada" component={CiudadCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Juntas" component={JuntasScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FormularioJunta" component={FormularioJuntaScreen} />
      <Stack.Screen name="JuntaCreada" component={JuntaCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SolicitudesReactivacion" component={SolicitudesReactivacionScreen} />
      <Stack.Screen name="Miembros" component={MiembrosScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FormularioMiembro" component={FormularioMiembroScreen} />
      <Stack.Screen name="MiembroCreado" component={MiembroCreadoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
