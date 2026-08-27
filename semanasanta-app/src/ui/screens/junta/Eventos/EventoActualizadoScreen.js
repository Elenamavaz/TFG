import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EventoCreadoScreen.styles';

// Mockup del 2026-08-22 ("Evento Actualizado"). Reutiliza los estilos de
// EventoCreadoScreen -misma pantalla de confirmación simple, un botón.
export function EventoActualizadoScreen({ route, navigation }) {
  const { ciudadId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Evento Actualizado</Text>
      <Text style={styles.subtitle}>El evento se ha actualizado correctamente.</Text>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Eventos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Ok</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
