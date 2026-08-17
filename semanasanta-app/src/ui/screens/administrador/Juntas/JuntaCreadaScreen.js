import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './JuntaCreadaScreen.styles';

// "Añadir miembros ahora" deshabilitado a propósito: la gestión de Miembros
// es la pasada siguiente (ver memoria del TFG), todavía no hay a dónde ir.
export function JuntaCreadaScreen({ route, navigation }) {
  const { nombreJunta } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Junta de Cofradías creada</Text>
      <Text style={styles.subtitle}>{nombreJunta} se ha creado correctamente. Ahora puedes añadir a sus miembros.</Text>

      <View style={styles.botonDeshabilitado}>
        <Text style={styles.botonDeshabilitadoTexto}>Añadir miembros ahora · Próximamente</Text>
      </View>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Juntas')} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
