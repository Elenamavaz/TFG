import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './JuntaCreadaScreen.styles';

// "Añadir miembros ahora" ya lleva a algo real (mockup de Miembros del
// 2026-08-17): antes quedaba deshabilitado porque esa pantalla no existía.
export function JuntaCreadaScreen({ route, navigation }) {
  const { nombreJunta, juntaId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
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
      {/* replace, no navigate (2026-08-21): con navigate, "atrás" desde
          Juntas volvería a enseñar esta misma pantalla -Elena no quiere que
          reaparezca "Junta de Cofradías creada" al volver atrás. */}
      <TouchableOpacity style={styles.boton} onPress={() => navigation.replace('Juntas')} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
