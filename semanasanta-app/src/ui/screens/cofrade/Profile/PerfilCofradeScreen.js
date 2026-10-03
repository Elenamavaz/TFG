import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useAuth, useCofrade } from '../../../../application/context';
import { getCofradiaPorId } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './PerfilCofradeScreen.styles';

// Panel del Cofrade (2026-10-03, a petición de Elena): se entra desde
// "Iniciar sesión" -pestaña Cofrade, con el código de acceso-, al mismo
// nivel que PerfilJuntaScreen/PerfilAdministradorScreen, y ya no desde el
// Perfil de Ciudadano. Sin barra de pestañas, mismo criterio que los otros
// paneles: para consultar la app como ciudadano, se cierra sesión. Como el
// código ya se validó al entrar, aquí solo queda compartir o dejar de
// compartir (la lógica vive en CofradeContext, para que los pings sigan
// aunque la pantalla se desmonte).
export function PerfilCofradeScreen({ navigation }) {
  const { cerrarSesion: cerrarSesionAuth } = useAuth();
  const {
    cofradiaId,
    compartiendo,
    cargando,
    error,
    procesionNombre,
    procesionesPendientes,
    empezarACompartir,
    elegirProcesion,
    cancelarEleccion,
    detenerCompartir,
  } = useCofrade();
  const [cofradia, setCofradia] = useState(null);

  useEffect(() => {
    if (!cofradiaId) return;
    getCofradiaPorId(cofradiaId)
      .then(setCofradia)
      .catch(() => setCofradia(null));
  }, [cofradiaId]);

  function cerrarSesion() {
    detenerCompartir(); // no seguir mandando pings con una sesión cerrada
    cerrarSesionAuth();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>La Semana Santa de {ciudad?.nombre ?? ''}</Text>
        <Text style={styles.subtitulo}>{cofradia ? cofradia.nombre : 'Cofrade'}</Text>

        <View style={styles.cofradeBanner}>
          <Text style={styles.cofradeTitulo}>Modo Cofrade activo</Text>
          <Text style={styles.cofradeTexto}>
            {compartiendo && procesionNombre
              ? `Compartiendo tu ubicación en "${procesionNombre}".`
              : 'Comparte tu ubicación en tiempo real durante la procesión para que los ciudadanos puedan seguirla.'}
          </Text>
          <TouchableOpacity
            style={[styles.ubicacionButton, compartiendo && styles.ubicacionButtonActivo]}
            onPress={compartiendo ? detenerCompartir : empezarACompartir}
            activeOpacity={0.8}
            disabled={cargando}
          >
            {cargando ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <>
                <Ionicons
                  name={compartiendo ? 'checkmark-circle' : 'navigate-outline'}
                  size={18}
                  color={compartiendo ? colors.lightGreenText : colors.background}
                />
                <Text style={[styles.ubicacionButtonTexto, compartiendo && styles.ubicacionButtonTextoActivo]}>
                  {compartiendo ? 'Compartiendo ubicación · Dejar de compartir' : 'Activar ubicación compartida'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {/* P.ej. no hay procesión en curso, o la procesión se ha
              finalizado sola a su hora de fin y se ha cortado el compartir
              (ver CofradeContext.enviarPing). */}
          {!compartiendo && error ? <Text style={styles.modalError}>{error}</Text> : null}
        </View>

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Más de una procesión de la cofradía en curso a la vez: hay que elegir. */}
      <Modal transparent visible={procesionesPendientes.length > 0} animationType="fade" onRequestClose={cancelarEleccion}>
        <Pressable style={styles.overlay} onPress={cancelarEleccion}>
          <Pressable style={styles.modalCodigo} onPress={() => {}}>
            <Text style={styles.modalTitulo}>¿A qué procesión te unes?</Text>
            <Text style={styles.modalSubtitulo}>
              Tu cofradía tiene más de una procesión en curso ahora mismo -elige a cuál te unes.
            </Text>
            {procesionesPendientes.map((procesion) => (
              <TouchableOpacity key={procesion.id} style={styles.modalProcesionItem} onPress={() => elegirProcesion(procesion)}>
                <Text style={styles.modalProcesionNombre}>{procesion.nombre}</Text>
                <Text style={styles.modalProcesionMeta}>
                  {procesion.dia} · {procesion.horaSalida}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalVolverButton} onPress={cancelarEleccion}>
              <Text style={styles.modalVolverTexto}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
