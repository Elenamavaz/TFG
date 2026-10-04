import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { styles } from './MiembroCreadoScreen.styles';

// A diferencia de JuntaCreadaScreen (donde "Añadir miembros ahora" seguía
// deshabilitado -Miembros no existía todavía-, aquí SÍ hay a dónde ir: el
// propio FormularioMiembro para la misma Junta, ver mockup del 2026-08-17.
export function MiembroCreadoScreen({ route, navigation }) {
  const { nombreMiembro, juntaId } = route.params;

  return (
    <common.ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Nuevo Miembro{'\n'}Creada</Text>
      <Text style={styles.subtitle}>
        {nombreMiembro} quedó registrado. Se le ha enviado el correo de acceso.
      </Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.replace('FormularioMiembro', { juntaId })}
        activeOpacity={0.85}
      >
        <Text style={styles.botonTexto}>Añadir otro miembro ahora</Text>
      </TouchableOpacity>
      {/* Al inicio del panel (2026-10-03, a petición de Elena; antes iba a
          la lista de Miembros). popToTop tampoco deja esta confirmación en
          el historial. */}
      <TouchableOpacity
        style={styles.botonSecundario}
        onPress={() => navigation.popToTop()}
        activeOpacity={0.85}
      >
        <Text style={styles.botonSecundarioTexto}>Ok</Text>
      </TouchableOpacity>
    </common.ScreenContainer>
  );
}
