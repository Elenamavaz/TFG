import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { styles } from '../Miembros/MiembroCreadoScreen.styles';

// Confirmación del alta de un administrador (2026-10-31), igual que
// MiembroCreadoScreen.
export function AdministradorCreadoScreen({ route, navigation }) {
  const { nombreAdministrador } = route.params;

  return (
    <common.ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Nuevo Administrador{'\n'}Creado</Text>
      <Text style={styles.subtitle}>
        {nombreAdministrador} quedó registrado. Se le ha enviado el correo de acceso.
      </Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.replace('FormularioAdministrador')}
        activeOpacity={0.85}
      >
        <Text style={styles.botonTexto}>Añadir otro administrador</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.botonSecundario} onPress={() => navigation.popToTop()} activeOpacity={0.85}>
        <Text style={styles.botonSecundarioTexto}>Ok</Text>
      </TouchableOpacity>
    </common.ScreenContainer>
  );
}
