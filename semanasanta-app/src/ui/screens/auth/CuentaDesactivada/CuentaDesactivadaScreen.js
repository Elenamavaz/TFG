import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useAuth } from '../../../../application/context';
import { solicitarReactivacion } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './CuentaDesactivadaScreen.styles';

// Destino tras un login correcto de un Miembro de Junta desactivado (ver
// AuthResponse.activo del backend, MiembroJuntaCofradiaService.exigirJunta):
// el login funciona igual -las credenciales son correctas-, pero en vez de
// llevarle al panel de Junta (todavía "próximamente", ver
// PanelProximamenteScreen), se le deja aquí. "Solicitar reactivación" es la
// única escritura que se le permite (MiembroJuntaCofradiaService la deja
// pasar aposta, sin pasar por exigirJunta): crea una solicitud que el
// Administrador ve y acepta/rechaza, ver SolicitudesReactivacionScreen.
export function CuentaDesactivadaScreen({ navigation }) {
  const { cerrarSesion } = useAuth();
  const [enviando, setEnviando] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [error, setError] = useState(null);

  async function pedirReactivacion() {
    if (enviando || solicitudEnviada) return;
    setError(null);
    setEnviando(true);
    try {
      await solicitarReactivacion();
      setSolicitudEnviada(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  function salir() {
    cerrarSesion();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer style={styles.container}>
      <Ionicons name="lock-closed-outline" size={40} color={colors.subtitle} />
      <Text style={styles.title}>Cuenta desactivada</Text>
      <Text style={styles.description}>
        Tu cuenta de Junta de Cofradía está desactivada y no puedes hacer cambios.{' '}
        {solicitudEnviada
          ? 'Ya se ha avisado al Administrador; espera a que revise tu solicitud.'
          : 'Puedes pedir que el Administrador la reactive.'}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.reactivarButton, (enviando || solicitudEnviada) && styles.botonDeshabilitado]}
        onPress={pedirReactivacion}
        activeOpacity={0.85}
        disabled={enviando || solicitudEnviada}
      >
        {enviando ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.reactivarTexto}>{solicitudEnviada ? 'Solicitud enviada' : 'Solicitar reactivación'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.cerrarSesionButton} onPress={salir} activeOpacity={0.85}>
        <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
