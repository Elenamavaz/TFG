import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useCofrade } from '../../../../application/context';
import { olvidarSesionLocal } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './PerfilCofradeScreen.styles';

// Perfil de Cofrade (2026-09-19, separado de PerfilScreen de Ciudadano: ver
// comentario ahí -al nivel de PerfilJuntaScreen/PerfilAdministradorScreen,
// no un interruptor dentro de otro perfil). Se entra desde "Modo Cofrade" en
// el Perfil de Ciudadano; compartir ubicación en sí sigue viviendo en
// CofradeContext, no en el estado de esta pantalla, así que el ping
// periódico sigue mandándose aunque se navegue fuera de aquí.
export function PerfilCofradeScreen({ navigation }) {
  const {
    compartiendo,
    cargando: validandoCodigo,
    error: errorCofrade,
    procesionNombre,
    procesionesPendientes,
    validarCodigo,
    elegirProcesion,
    detenerCompartir,
    limpiarError,
  } = useCofrade();

  const [modalCodigoVisible, setModalCodigoVisible] = useState(false);
  const [codigoTexto, setCodigoTexto] = useState('');

  // Cierra el modal en cuanto empieza a compartir de verdad -tanto si se
  // resolvió sola (código válido, procesión evidente) como si hizo falta
  // elegir procesión a mano (ver elegirProcesion en CofradeContext).
  useEffect(() => {
    if (compartiendo) setModalCodigoVisible(false);
  }, [compartiendo]);

  function abrirModalCodigo() {
    limpiarError();
    setCodigoTexto('');
    setModalCodigoVisible(true);
  }

  function cerrarModalCodigo() {
    if (validandoCodigo) return; // no cerrar a medio validar
    setModalCodigoVisible(false);
  }

  function confirmarCodigo() {
    if (!codigoTexto.trim() || validandoCodigo) return;
    validarCodigo(codigoTexto.trim());
  }

  // El JWT de Cofrade no pasa por AuthContext (ver CofradeContext): "cerrar
  // sesión" aquí es la misma acción de dispositivo que en el Perfil de
  // Ciudadano -olvidar la ciudad/modo guardados y volver a Bienvenida.
  async function cerrarSesion() {
    await olvidarSesionLocal();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Modo Cofrade</Text>

        <View style={styles.cofradeBanner}>
          <Text style={styles.cofradeTitulo}>Modo Cofrade activo</Text>
          <Text style={styles.cofradeTexto}>
            {compartiendo && procesionNombre
              ? `Compartiendo tu ubicación en "${procesionNombre}".`
              : 'Puedes compartir tu ubicación durante la procesión en tiempo real con tu cofradía.'}
          </Text>
          {/* P.ej. la procesión se ha finalizado sola a su hora de fin y se ha
              cortado el compartir (ver CofradeContext.enviarPing). */}
          {!compartiendo && !modalCodigoVisible && errorCofrade ? (
            <Text style={styles.modalError}>{errorCofrade}</Text>
          ) : null}
          <TouchableOpacity
            style={[styles.ubicacionButton, compartiendo && styles.ubicacionButtonActivo]}
            onPress={compartiendo ? detenerCompartir : abrirModalCodigo}
            activeOpacity={0.8}
          >
            <Ionicons
              name={compartiendo ? 'checkmark-circle' : 'navigate-outline'}
              size={18}
              color={compartiendo ? colors.lightGreenText : colors.background}
            />
            <Text style={[styles.ubicacionButtonTexto, compartiendo && styles.ubicacionButtonTextoActivo]}>
              {compartiendo ? 'Compartiendo ubicación · Dejar de compartir' : 'Activar ubicación compartida'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal transparent visible={modalCodigoVisible} animationType="fade" onRequestClose={cerrarModalCodigo}>
        <Pressable style={styles.overlay} onPress={cerrarModalCodigo}>
          <Pressable style={styles.modalCodigo} onPress={() => {}}>
            {procesionesPendientes.length > 0 ? (
              <>
                <Text style={styles.modalTitulo}>¿A qué procesión te unes?</Text>
                <Text style={styles.modalSubtitulo}>
                  Tu cofradía tiene más de una procesión en curso ahora mismo -elige a cuál te unes.
                </Text>
                {procesionesPendientes.map((procesion) => (
                  <TouchableOpacity
                    key={procesion.id}
                    style={styles.modalProcesionItem}
                    onPress={() => elegirProcesion(procesion)}
                  >
                    <Text style={styles.modalProcesionNombre}>{procesion.nombre}</Text>
                    <Text style={styles.modalProcesionMeta}>
                      {procesion.dia} · {procesion.horaSalida}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.modalTitulo}>Código de acceso</Text>
                <Text style={styles.modalSubtitulo}>
                  Introduce el código que te dio tu cofradía para compartir tu ubicación durante la procesión.
                </Text>
                <TextInput
                  value={codigoTexto}
                  onChangeText={setCodigoTexto}
                  placeholder="Código de acceso"
                  placeholderTextColor={colors.subtitle}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  style={styles.modalInput}
                />
                {errorCofrade ? <Text style={styles.modalError}>{errorCofrade}</Text> : null}

                <View style={styles.modalAcciones}>
                  <TouchableOpacity style={styles.modalVolverButton} onPress={cerrarModalCodigo} disabled={validandoCodigo}>
                    <Text style={styles.modalVolverTexto}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalConfirmarButton, !codigoTexto.trim() && styles.modalConfirmarButtonDeshabilitado]}
                    onPress={confirmarCodigo}
                    disabled={!codigoTexto.trim() || validandoCodigo}
                  >
                    {validandoCodigo ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text style={styles.modalConfirmarTexto}>Validar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
