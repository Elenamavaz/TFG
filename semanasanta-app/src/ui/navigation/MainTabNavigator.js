import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InicioStackNavigator } from './InicioStackNavigator';
import { BuscarStackNavigator } from './BuscarStackNavigator';
import { PerfilStackNavigator } from './PerfilStackNavigator';
import { CalendarioScreen, MapaScreen } from '../screens/ciudadano';
import { colors, fontFamilies } from '../../theme';

const Tab = createBottomTabNavigator();

const ICONOS_POR_TAB = {
  Inicio: 'home',
  Calendario: 'calendar',
  Mapa: 'map',
  Buscar: 'search',
  Perfil: 'person',
};

// Ruta "home" de cada tab que tiene su propio stack interno, para saber
// cuándo ocultar la tab bar (al entrar en un listado/detalle) y cuándo
// mostrarla de nuevo, siguiendo el patrón de los mockups (Sección 4.1).
const RUTA_HOME_POR_TAB = { Inicio: 'InicioHome', Buscar: 'BuscarHome', Perfil: 'PerfilHome' };

function tabBarStyleParaStack(route, nombreTab) {
  const rutaHome = RUTA_HOME_POR_TAB[nombreTab];
  if (!rutaHome) return undefined;
  const rutaActiva = getFocusedRouteNameFromRoute(route) ?? rutaHome;
  return rutaActiva === rutaHome ? undefined : { display: 'none' };
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.subtitle,
        tabBarStyle: [
          {
            backgroundColor: colors.background,
            borderTopColor: colors.subtitle,
            borderWidth: 0.5,
            height: 76,
            paddingTop: 8,
          },
          tabBarStyleParaStack(route, route.name),
        ],
        tabBarLabelStyle: { fontFamily: fontFamilies.uiMedium, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={`${ICONOS_POR_TAB[route.name]}${focused ? '' : '-outline'}`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={InicioStackNavigator} />
      <Tab.Screen name="Calendario" component={CalendarioScreen} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Buscar" component={BuscarStackNavigator} />
      <Tab.Screen name="Perfil" component={PerfilStackNavigator} />
    </Tab.Navigator>
  );
}
