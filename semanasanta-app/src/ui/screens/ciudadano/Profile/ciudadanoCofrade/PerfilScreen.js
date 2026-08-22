import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { ScreenContainer, StatusBadge } from '../../../../components/common';
import { useCiudad, useCofrade, useFavoritos } from '../../../../../application/context';
import {
  getCofradiasPorCiudad,
  getDiasSemanaSanta,
  getEventoPorId,
  getProcesionPorId,
  olvidarSesionLocal,
} from '../../../../../data/services';
import { colors } from '../../../../../theme';
import { styles } from './PerfilScreen.styles';

const NOTIFICACIONES_INICIALES = [
  { id: 'procesiones', titulo: 'Notificaciones procesiones', descripcion: 'Aviso cuando una procesión comienza', activo: true },
  { id: 'eventos', titulo: 'Notificaciones eventos', descripcion: 'Cortes de calle y desvíos', activo: true },
];

export function PerfilScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const { favoritos } = useFavoritos();
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

  const [modoAcceso, setModoAcceso] = useState('ciudadano');
  const [modalCodigoVisible, setModalCodigoVisible] = useState(false);
  const [codigoTexto, setCodigoTexto] = useState('');
  const [numCofradias, setNumCofradias] = useState(0);
  const [diasSemanaSanta, setDiasSemanaSanta] = useState([]);
  const [favoritosResueltos, setFavoritosResueltos] = useState([]);
  const [notificaciones, setNotificaciones] = useState(NOTIFICACIONES_INICIALES);

  useEffect(() => {
    getDiasSemanaSanta().then(setDiasSemanaSanta);
  }, []);

  useEffect(() => {
    if (!ciudadSeleccionada) return;
    getCofradiasPorCiudad(ciudadSeleccionada.id).then((lista) => setNumCofradias(lista.length));
  }, [ciudadSeleccionada]);

  useEffect(() => {
    Promise.all(
      favoritos.map((f) =>
        (f.tipo === 'procesion' ? getProcesionPorId(f.id) : getEventoPorId(f.id)).then((item) => {
          if (!item) return null;
          const diaNombre = f.tipo === 'procesion' ? item.dia : diasSemanaSanta.find((d) => d.fecha === item.fecha)?.nombre;
          return {
            id: item.id,
            tipo: f.tipo,
            nombre: item.nombre,
            diaNombre: diaNombre ?? null,
            hora: f.tipo === 'procesion' ? item.horaSalida : item.hora,
            estado: item.estado,
          };
        })
      )
    ).then((lista) => setFavoritosResueltos(lista.filter(Boolean)));
  }, [favoritos, diasSemanaSanta]);

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

  function abrirFavorito(favorito) {
    if (favorito.tipo === 'procesion') {
      navigation.navigate('DetalleProcesion', { procesionId: favorito.id });
    }
    // los eventos no tienen pantalla de detalle todavía (se añadirá en una iteración posterior)
  }

  function alternarNotificacion(id) {
    setNotificaciones((actuales) => actuales.map((n) => (n.id === id ? { ...n, activo: !n.activo } : n)));
  }

  // Ni Ciudadano ni Cofrade (en este selector local, sin login de código de
  // acceso conectado todavía) tienen JWT que invalidar -"cerrar sesión" aquí
  // es olvidar la ciudad/modo guardados en este dispositivo y volver a
  // Bienvenida, como la primera vez que se abre la app (ver preferenciasService).
  async function cerrarSesion() {
    await olvidarSesionLocal();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  const esCofrade = modoAcceso === 'cofrade';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        <Text style={styles.sectionTitle}>Modo de acceso</Text>
        <View style={styles.modoRow}>
          <TouchableOpacity
            style={[styles.modoButton, !esCofrade && styles.modoButtonActivoCiudadano]}
            onPress={() => setModoAcceso('ciudadano')}
            activeOpacity={0.8}
          >
            <Ionicons name="person" size={16} color={!esCofrade ? colors.cream : colors.subtitle} />
            <Text style={[styles.modoButtonTexto, !esCofrade && styles.modoButtonTextoActivoCiudadano]}>
              Ciudadano
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modoButton, esCofrade && styles.modoButtonActivoCofrade]}
            onPress={() => setModoAcceso('cofrade')}
            activeOpacity={0.8}
          >
            <Ionicons name="shield" size={16} color={esCofrade ? colors.background : colors.subtitle} />
            <Text style={[styles.modoButtonTexto, esCofrade && styles.modoButtonTextoActivoCofrade]}>Cofrade</Text>
          </TouchableOpacity>
        </View>

        {esCofrade ? (
          <View style={styles.cofradeBanner}>
            <Text style={styles.cofradeTitulo}>Modo Cofrade activo</Text>
            <Text style={styles.cofradeTexto}>
              {compartiendo && procesionNombre
                ? `Compartiendo tu ubicación en "${procesionNombre}".`
                : 'Puedes compartir tu ubicación durante la procesión en tiempo real con tu cofradía.'}
            </Text>
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
        ) : null}

        <Text style={styles.sectionTitle}>Ciudad seleccionada</Text>
        <TouchableOpacity
          style={styles.ciudadCard}
          onPress={() => navigation.getParent()?.navigate('SeleccionCiudad')}
          activeOpacity={0.8}
        >
          <View style={styles.ciudadCardLeft}>
            <Octicons name="location" size={18} color={colors.gold} />
            <View>
              <Text style={styles.ciudadNombre}>{ciudadSeleccionada?.nombre}</Text>
              <Text style={styles.ciudadMeta}>
                {ciudadSeleccionada?.numProcesiones ?? 0} procesiones · {numCofradias} cofradías
              </Text>
            </View>
          </View>
          <View style={styles.cambiarRow}>
            <Text style={styles.cambiar}>Cambiar</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gold} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Mis favoritos ({favoritosResueltos.length})</Text>
        {favoritosResueltos.length > 0 ? (
          favoritosResueltos.map((favorito) => (
            <TouchableOpacity
              key={`${favorito.tipo}-${favorito.id}`}
              style={styles.favoritoCard}
              onPress={() => abrirFavorito(favorito)}
              activeOpacity={favorito.tipo === 'procesion' ? 0.8 : 1}
              disabled={favorito.tipo !== 'procesion'}
            >
              <Ionicons name="heart" size={18} color={colors.gold} />
              <View style={styles.favoritoTextBlock}>
                <Text style={styles.favoritoTitulo} numberOfLines={1}>
                  {favorito.nombre}
                </Text>
                <Text style={styles.favoritoMeta}>
                  {favorito.diaNombre ? `${favorito.diaNombre} · ` : ''}
                  {favorito.hora}
                </Text>
              </View>
              <StatusBadge estado={favorito.estado} />
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.empty}>
            Aún no tienes procesiones ni eventos favoritos. Toca el corazón en cualquier tarjeta para guardarlos aquí.
          </Text>
        )}

        {/* Solo en modo Ciudadano (2026-08-21, Elena): como Cofrade la única
            acción de este perfil es compartir ubicación -no tiene sentido
            ofrecer preferencias de notificación de un actor que en la
            práctica navega la app como Ciudadano en cuanto no está
            compartiendo. */}
        {!esCofrade ? (
          <>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            <View style={styles.notificacionesCard}>
              {notificaciones.map((notificacion, indice) => (
                <View
                  key={notificacion.id}
                  style={[styles.notificacionRow, indice > 0 && styles.notificacionRowConBorde]}
                >
                  <View style={styles.notificacionTextBlock}>
                    <Text style={styles.notificacionTitulo}>{notificacion.titulo}</Text>
                    <Text style={styles.notificacionDescripcion}>{notificacion.descripcion}</Text>
                  </View>
                  <Switch
                    value={notificacion.activo}
                    onValueChange={() => alternarNotificacion(notificacion.id)}
                    trackColor={{ false: colors.surfaceAlt, true: colors.gold }}
                    thumbColor={colors.cream}
                  />
                </View>
              ))}
            </View>
          </>
        ) : null}

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
