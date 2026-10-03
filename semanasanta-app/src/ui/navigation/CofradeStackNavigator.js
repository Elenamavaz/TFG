import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PerfilCofradeScreen } from '../screens/cofrade/Profile/PerfilCofradeScreen';
import { colors } from '../../theme';

const Stack = createNativeStackNavigator();

// Panel del Cofrade (2026-10-03): mismo nivel que JuntaStack/
// AdministradorStack en RootNavigator, en pila simple y sin barra de
// pestañas a propósito (mismo criterio que los otros dos paneles). De
// momento una sola pantalla; la pila deja sitio a crecer sin tocar
// RootNavigator.
export function CofradeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="PerfilCofrade" component={PerfilCofradeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
