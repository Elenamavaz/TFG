import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EventoCreadoScreen.styles';

// "Añadir pasos" (2026-08-23, "los eventos también pueden tener pasos", no
// solo las procesiones) lleva a SeleccionarPasosEventoScreen -mismo patrón
// que ProcesionCreadaScreen.
export function EventoCreadoScreen({ route, navigation }) {
  const { nombreEvento, ciudadId, eventoId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Evento creado</Text>
      <Text style={styles.subtitle}>El evento "{nombreEvento}" se ha creado correctamente.</Text>

      <TouchableOpacity
        style={styles.añadirPasosButton}
        onPress={() => navigation.navigate('SeleccionarPasosEvento', { eventoId, ciudadId })}
        activeOpacity={0.85}
      >
        <Text style={styles.añadirPasosTexto}>Añadir pasos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Eventos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
