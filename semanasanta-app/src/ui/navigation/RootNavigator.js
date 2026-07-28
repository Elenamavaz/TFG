import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SeleccionCiudadScreen } from '../screens/ciudadano';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SeleccionCiudad" component={SeleccionCiudadScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}
