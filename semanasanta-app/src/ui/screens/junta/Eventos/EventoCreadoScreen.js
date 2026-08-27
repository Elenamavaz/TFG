import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EventoCreadoScreen.styles';

// Mismo patrón simple que CiudadCreadaScreen/PasoCreadoScreen (confirmación
// con un solo botón).
export function EventoCreadoScreen({ route, navigation }) {
  const { nombreEvento, ciudadId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Evento creado</Text>
      <Text style={styles.subtitle}>El evento "{nombreEvento}" se ha creado correctamente.</Text>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Eventos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Ok</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
