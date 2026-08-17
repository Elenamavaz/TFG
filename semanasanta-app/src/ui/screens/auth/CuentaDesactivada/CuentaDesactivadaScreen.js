import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useAuth } from '../../../../application/context';
import { colors } from '../../../../theme';
import { styles } from './CuentaDesactivadaScreen.styles';

// Destino tras un login correcto de un Miembro de Junta desactivado (ver
// AuthResponse.activo del backend, MiembroJuntaCofradiaService.exigirJunta):
// el login funciona igual -las credenciales son correctas-, pero en vez de
// llevarle al panel de Junta (todavía "próximamente", ver
// PanelProximamenteScreen), se le deja aquí sin más acción posible que
// cerrar sesión. El backend rechaza cualquier escritura de todas formas, así
// que esto es solo la explicación -no la barrera real- de por qué no puede
// hacer nada.
export function CuentaDesactivadaScreen({ navigation }) {
  const { cerrarSesion } = useAuth();

  function salir() {
    cerrarSesion();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer style={styles.container}>
      <Ionicons name="lock-closed-outline" size={40} color={colors.subtitle} />
      <Text style={styles.title}>Cuenta desactivada</Text>
      <Text style={styles.description}>
        Tu cuenta de Junta de Cofradía está desactivada y no puedes hacer cambios. Solicita al Administrador que la
        reactive.
      </Text>

      <TouchableOpacity style={styles.cerrarSesionButton} onPress={salir} activeOpacity={0.85}>
        <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
