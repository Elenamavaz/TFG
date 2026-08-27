import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './PasoCreadoScreen.styles';

// El mockup traía el texto de MiembroCreadoScreen pegado por error ("El
// nuevo miembro quedó registrado..."); aquí va el texto real del paso.
// Reutiliza los estilos de PasoCreadoScreen (misma pantalla de confirmación
// simple, un botón).
export function PasoActualizadoScreen({ route, navigation }) {
  const { ciudadId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Paso actualizado</Text>
      <Text style={styles.subtitle}>El paso se ha actualizado correctamente.</Text>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Pasos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Ok</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
