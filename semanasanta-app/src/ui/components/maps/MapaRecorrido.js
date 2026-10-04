import { Text, View } from 'react-native';
import { styles } from './mapas.styles';

// Versión web de MapaRecorrido: react-native-maps solo funciona en
// Android/iOS (ver MapaRecorrido.native.js, que Metro elige en el móvil).
export function MapaRecorrido() {
  return (
    <View style={styles.avisoWeb}>
      <Text style={styles.avisoWebTexto}>El mapa del recorrido está disponible en la app para Android e iOS.</Text>
    </View>
  );
}
