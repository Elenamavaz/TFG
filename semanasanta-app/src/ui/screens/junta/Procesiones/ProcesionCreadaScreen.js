import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './ProcesionCreadaScreen.styles';

// "Añadir pasos" deshabilitado a propósito: Pasos sigue sin sus propias
// pantallas (ver PerfilJuntaScreen, "Próximamente"), igual que pasó con
// Miembros antes de tener las suyas.
export function ProcesionCreadaScreen({ route, navigation }) {
  const { nombreProcesion, ciudadId } = route.params;

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

      <View style={styles.botonDeshabilitado}>
        <Text style={styles.botonDeshabilitadoTexto}>Añadir pasos · Próximamente</Text>
      </View>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Procesiones', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
