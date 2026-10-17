import { useCallback, useEffect, useState } from 'react';
import { AppState, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './PerfilScreen.styles';

const ETIQUETAS_FAVORITO = [
  { tipo: 'procesion', singular: 'procesión', plural: 'procesiones' },
  { tipo: 'evento', singular: 'evento', plural: 'eventos' },
  { tipo: 'cofradia', singular: 'cofradía', plural: 'cofradías' },
  { tipo: 'paso', singular: 'paso', plural: 'pasos' },
];

function resumenFavoritos(favoritos) {
  if (favoritos.length === 0) return 'Aún no has marcado ninguno';
  return ETIQUETAS_FAVORITO.map(({ tipo, singular, plural }) => {
    const n = favoritos.filter((f) => f.tipo === tipo).length;
    return n > 0 ? `${n} ${n === 1 ? singular : plural}` : null;
  })
    .filter(Boolean)
    .join(' · ');
}

export function PerfilScreen({ navigation }) {
  const { ciudadSeleccionada } = context.useCiudad();
  const { favoritos } = context.useFavoritos();
  const [numCofradias, setNumCofradias] = useState(0);
  const [numProcesiones, setNumProcesiones] = useState(0);
  const [notificacionesActivas, setNotificacionesActivas] = useState(null);

  const leerPermisoNotificaciones = useCallback(() => {
    Notifications.getPermissionsAsync()
      .then((permiso) => setNotificacionesActivas(permiso.granted))
      .catch(() => setNotificacionesActivas(null));
  }, []);

  useEffect(() => {
    leerPermisoNotificaciones();
    const suscripcion = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') leerPermisoNotificaciones();
    });
    return () => suscripcion.remove();
  }, [leerPermisoNotificaciones]);

  useEffect(() => {
    if (!ciudadSeleccionada) return;
    services.getCofradiasPorCiudad(ciudadSeleccionada.id).then((lista) => setNumCofradias(lista.length));
    services.getProcesionesPorCiudad(ciudadSeleccionada.id).then((lista) => setNumProcesiones(lista.length));
  }, [ciudadSeleccionada]);

  // El Ciudadano no tiene JWT que invalidar -"cerrar sesión" aquí es olvidar
  // la ciudad/modo guardados en este dispositivo y volver a Bienvenida, como
  // la primera vez que se abre la app (ver preferenciasService).
  async function cerrarSesion() {
    await services.olvidarSesionLocal();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

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
                {numProcesiones} procesiones · {numCofradias} cofradías
              </Text>
            </View>
          </View>
          <View style={styles.cambiarRow}>
            <Text style={styles.cambiar}>Cambiar</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gold} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Mis favoritos</Text>
        <TouchableOpacity
          style={styles.ciudadCard}
          onPress={() => navigation.navigate('Listado', { tipo: 'favoritos' })}
          activeOpacity={0.8}
        >
          <View style={styles.ciudadCardLeft}>
            <Ionicons name="heart" size={18} color={colors.gold} />
            <View>
              <Text style={styles.ciudadNombre}>
                {favoritos.length === 1 ? '1 favorito' : `${favoritos.length} favoritos`}
              </Text>
              <Text style={styles.ciudadMeta}>{resumenFavoritos(favoritos)}</Text>
            </View>
          </View>
          <View style={styles.cambiarRow}>
            <Text style={styles.cambiar}>Ver</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.gold} />
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <TouchableOpacity style={styles.notificacionesCard} onPress={() => Linking.openSettings()} activeOpacity={0.8}>
          <View style={styles.notificacionRow}>
            <View style={styles.notificacionTextBlock}>
              <Text style={styles.notificacionTitulo}>
                {notificacionesActivas === false ? 'Notificaciones desactivadas' : 'Notificaciones activadas'}
              </Text>
              <Text style={styles.notificacionDescripcion}>
                {notificacionesActivas === false
                  ? `No recibirás avisos de ${ciudadSeleccionada?.nombre ?? 'tu ciudad'}. Actívalas en los ajustes del móvil.`
                  : `Recibes los avisos de procesiones y eventos de ${ciudadSeleccionada?.nombre ?? 'tu ciudad'}.`}
              </Text>
            </View>
            <View style={styles.cambiarRow}>
              <Text style={styles.cambiar}>Ajustes</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gold} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </common.ScreenContainer>
  );
}
