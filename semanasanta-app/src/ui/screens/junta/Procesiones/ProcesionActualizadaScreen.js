import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './ProcesionActualizadaScreen.styles';

// Confirmación aparte de ProcesionCreadaScreen (mockup del 2026-08-20, Elena
// pidió mantener las dos pantallas separadas): mismo patrón, pero
// "Actualizar pasos" en vez de "Añadir pasos" -habilitado desde el
// 2026-08-23, misma SeleccionarPasosScreen (sirve igual para elegir de cero
// que para cambiar la selección ya hecha).
export function ProcesionActualizadaScreen({ route, navigation }) {
  const { ciudadId, procesionId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Procesion{'\n'}Actualizada</Text>
      <Text style={styles.subtitle}>La procesión se ha actualizado correctamente</Text>

      <TouchableOpacity
        style={styles.añadirPasosButton}
        onPress={() => navigation.navigate('SeleccionarPasos', { procesionId, ciudadId })}
        activeOpacity={0.85}
      >
        <Text style={styles.añadirPasosTexto}>Actualizar pasos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Procesiones', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
