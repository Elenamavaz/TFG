import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './LoginScreen.styles';

// TODO(iteración 2+): formulario real (email/código de cofrade + contraseña)
// contra Firebase Auth. De momento solo deja volver a Bienvenida.
export function LoginScreen({ navigation }) {
  return (
    <ScreenContainer style={styles.container}>
      <TouchableOpacity
        style={styles.volver}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="arrow-back" size={22} color={colors.subtitle} />
      </TouchableOpacity>

      <View style={styles.contenido}>
        <Ionicons name="shield-outline" size={40} color={colors.subtitle} />
        <Text style={styles.title}>Acceso de Juntas y Administradores</Text>
        <Text style={styles.description}>
          El inicio de sesión para Juntas de Cofradía y Administradores llegará en una iteración
          posterior, cuando la app se conecte con las cuentas de Firebase.
        </Text>
      </View>
    </ScreenContainer>
  );
}
