import { Text, View } from 'react-native';
import { styles } from './mapas.styles';

// Versión web de MapaUbicacion: react-native-maps solo funciona en
// Android/iOS (ver MapaUbicacion.native.js, que Metro elige en el móvil).
export function MapaUbicacion({ latitud, longitud }) {
  if (latitud == null || longitud == null) return null;
  return (
    <View style={styles.avisoWeb}>
      <Text style={styles.avisoWebTexto}>El mapa está disponible en la app para Android e iOS.</Text>
    </View>
  );
}
