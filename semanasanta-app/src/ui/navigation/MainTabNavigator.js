import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { InicioStackNavigator } from './InicioStackNavigator';
import { CalendarioStackNavigator } from './CalendarioStackNavigator';
import { BuscarStackNavigator } from './BuscarStackNavigator';
import { PerfilStackNavigator } from './PerfilStackNavigator';
import { MapaScreen } from '../screens/ciudadano';
import { colors, fontFamilies } from '../../theme';

const Tab = createBottomTabNavigator();

const ICONOS_POR_TAB = {
  Inicio: 'home',
  Calendario: 'calendar',
  Mapa: 'map',
  Buscar: 'search',
  Perfil: 'person',
};

// Pantallas de "detalle" (dentro de los stacks de cada tab) que ocultan la
// tab bar, siguiendo el patrón de los mockups (Sección 4.1). El resto -las
// "home" de cada tab y los listados (Cofradías, Procesiones, Pasos...)-
// mantienen la tab bar visible.
const RUTAS_SIN_TAB_BAR = new Set([
  'DetalleCofradia',
  'DetalleProcesion',
  'DetalleProcesionInfo',
  'DetallePaso',
  'DetalleEvento',
]);

function tabBarStyleParaStack(route) {
  const rutaActiva = getFocusedRouteNameFromRoute(route);
  return rutaActiva && RUTAS_SIN_TAB_BAR.has(rutaActiva) ? { display: 'none' } : undefined;
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
            borderTopWidth: 0.5,
            height: 76,
            paddingTop: 8,
          },
          tabBarStyleParaStack(route),
        ],
        tabBarLabelStyle: { fontFamily: fontFamilies.uiMedium, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={`${ICONOS_POR_TAB[route.name]}${focused ? '' : '-outline'}`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioStackNavigator}
        listeners={({ navigation }) => ({
          // El tab "Inicio" siempre debe llevar a la pantalla de inicio, aunque
          // se haya dejado su stack a medias (p. ej. tras "Ir a la procesión"
          // desde un detalle, que salta al tab Mapa): no se limita a cambiar de
          // tab y reanudar donde estaba, sino que resetea a InicioHome.
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('Inicio', { screen: 'InicioHome' });
          },
        })}
      />
      <Tab.Screen name="Calendario" component={CalendarioStackNavigator} />
      <Tab.Screen name="Mapa" component={MapaScreen} />
      <Tab.Screen name="Buscar" component={BuscarStackNavigator} />
      <Tab.Screen name="Perfil" component={PerfilStackNavigator} />
    </Tab.Navigator>
  );
}
