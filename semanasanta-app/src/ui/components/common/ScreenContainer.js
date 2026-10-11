import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './ScreenContainer.styles';

// SafeAreaView de react-native-safe-area-context, no el de react-native
// (2026-10-10): ese solo hace algo en iOS, y desde el SDK 54 Android pinta
// la app de borde a borde -sin él, el contenido quedaba pegado bajo la barra
// de estado y la de navegación del móvil. Este mide cuánto se solapa la
// vista con esas barras, así que bajo una cabecera de navegación o encima de
// la barra de pestañas no añade nada de más.
export function ScreenContainer({ children, style }) {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
}
