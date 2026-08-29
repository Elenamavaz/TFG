import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './ProcesionCreadaScreen.styles';

// "Añadir pasos" habilitado desde el 2026-08-23 -lleva a SeleccionarPasosScreen
// (antes deshabilitado, "Pasos sigue sin sus propias pantallas").
export function ProcesionCreadaScreen({ route, navigation }) {
  const { nombreProcesion, ciudadId, procesionId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Procesion creada</Text>
      <Text style={styles.subtitle}>
        La procesión "{nombreProcesion}" se ha creado correctamente. Ahora puedes añadir los pasos que participarán
        en ella o continuar más tarde.
      </Text>

      <TouchableOpacity
        style={styles.añadirPasosButton}
        onPress={() => navigation.navigate('SeleccionarPasos', { procesionId, ciudadId })}
        activeOpacity={0.85}
      >
        <Text style={styles.añadirPasosTexto}>Añadir pasos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Procesiones', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
