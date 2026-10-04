import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { styles } from './JuntaCreadaScreen.styles';

// "Añadir miembros ahora" ya lleva a algo real (mockup de Miembros del
// 2026-08-17): antes quedaba deshabilitado porque esa pantalla no existía.
export function JuntaCreadaScreen({ route, navigation }) {
  const { nombreJunta, juntaId } = route.params;

  return (
    <common.ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Junta de Cofradías creada</Text>
      <Text style={styles.subtitle}>{nombreJunta} se ha creado correctamente. Ahora puedes añadir a sus miembros.</Text>

      <TouchableOpacity
        style={styles.botonPrimario}
        onPress={() => navigation.replace('FormularioMiembro', { juntaId })}
        activeOpacity={0.85}
      >
        <Text style={styles.botonPrimarioTexto}>Añadir miembros ahora</Text>
      </TouchableOpacity>
      {/* Al inicio del panel (2026-10-03, a petición de Elena; antes iba a
          la lista de Juntas). popToTop tampoco deja esta confirmación en el
          historial, igual que el replace de antes. */}
      <TouchableOpacity style={styles.boton} onPress={() => navigation.popToTop()} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </common.ScreenContainer>
  );
}
