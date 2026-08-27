import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './PasoCreadoScreen.styles';

// El mockup traía el texto de MiembroCreadoScreen pegado por error ("Junta
// de Cofradías de Cáceres se ha creado..."); aquí va el texto real del
// paso, mismo patrón que CiudadCreadaScreen (confirmación simple, un botón).
export function PasoCreadoScreen({ route, navigation }) {
  const { nombrePaso, ciudadId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Paso creado</Text>
      <Text style={styles.subtitle}>El paso "{nombrePaso}" se ha creado correctamente.</Text>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Pasos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Ok</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
