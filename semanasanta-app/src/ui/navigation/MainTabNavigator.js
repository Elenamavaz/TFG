import { createBottomTabNavigator, getFocusedRouteNameFromRoute } from '@react-navigation';
import { Ionicons } from '@expo/vector-icons';
import { InicioStackNavigator } from './InicioStackNavigator';
import { CalendarioScreen, MapaScreen, BuscarScreen, PerfilScreen } from '../screens/ciudadano';
import { colors, fontFamilies } from '../../theme';

const Tab = createBottomTabNavigator();

const ICONOS_POR_TAB = {
  Inicio: 'home',
  Calendario: 'calendar',
  Mapa: 'map',
  Buscar: 'search',
  Perfil: 'person',
};

// Oculta la tab bar cuando el usuario navega a un listado o a un detalle
// dentro del stack de Inicio, siguiendo el patrón de los mockups (Sección 4.1).
function tabBarStyleParaInicio(route) {
  const rutaActiva = getFocusedRouteNameFromRoute(route) ?? 'InicioHome';
  return rutaActiva === 'InicioHome' ? undefined : { display: 'none' };
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.goldMuted,
        tabBarStyle: [
          { backgroundColor: colors.backgroundAlt, borderTopColor: colors.surface },
          route.name === 'Inicio' ? tabBarStyleParaInicio(route) : null,
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
      <Tab.Screen name="Buscar" component={BuscarScreen} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}
