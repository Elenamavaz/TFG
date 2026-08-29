import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EventoCreadoScreen.styles';

// Mockup del 2026-08-22 ("Evento Actualizado"). Reutiliza los estilos de
// EventoCreadoScreen. "Actualizar pasos" (2026-08-23) lleva a
// SeleccionarPasosEventoScreen -mismo patrón que ProcesionActualizadaScreen.
export function EventoActualizadoScreen({ route, navigation }) {
  const { ciudadId, eventoId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Evento Actualizado</Text>
      <Text style={styles.subtitle}>El evento se ha actualizado correctamente.</Text>

      <TouchableOpacity
        style={styles.añadirPasosButton}
        onPress={() => navigation.navigate('SeleccionarPasosEvento', { eventoId, ciudadId })}
        activeOpacity={0.85}
      >
        <Text style={styles.añadirPasosTexto}>Actualizar pasos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Eventos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
