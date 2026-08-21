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
      {/* Sin headerShown: false (no como PerfilAdministrador): SÍ necesitan
          la flecha de volver del header nativo -mockup del panel Admin,
          corregido 2026-08-21 tras detectar que faltaba comparando con el
          mockup. Sin "title" aquí tampoco: cada una pone el suyo por dentro
          con navigation.setOptions (mismo patrón que MiembrosScreen/
          SolicitudesReactivacionScreen ya usaban) -dejarlo solo en el
          navigator con title:'' dejaba un hueco raro encima del título
          grande del cuerpo, distinto del resto de pantallas del panel. */}
      <Stack.Screen name="Ciudades" component={CiudadesScreen} />
      <Stack.Screen name="FormularioCiudad" component={FormularioCiudadScreen} />
      <Stack.Screen name="CiudadCreada" component={CiudadCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Juntas" component={JuntasScreen} />
      <Stack.Screen name="FormularioJunta" component={FormularioJuntaScreen} />
      <Stack.Screen name="JuntaCreada" component={JuntaCreadaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SolicitudesReactivacion" component={SolicitudesReactivacionScreen} />
      <Stack.Screen name="Miembros" component={MiembrosScreen} />
      <Stack.Screen name="FormularioMiembro" component={FormularioMiembroScreen} />
      <Stack.Screen name="MiembroCreado" component={MiembroCreadoScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
