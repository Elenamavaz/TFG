import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { ScreenContainer, StatusBadge } from '../../../../components/common';
import { useCiudad, useFavoritos } from '../../../../../application/context';
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
  { id: 'procesiones-en-curso', titulo: 'Procesiones en curso', descripcion: 'Aviso cuando una procesión comienza', activo: false },
  { id: 'alertas-trafico', titulo: 'Alertas de tráfico', descripcion: 'Cortes de calle y desvíos', activo: true },
  { id: 'retrasos', titulo: 'Retrasos', descripcion: 'Cambios en el horario', activo: true },
];

export function PerfilScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const { favoritos } = useFavoritos();

  const [modoAcceso, setModoAcceso] = useState('ciudadano');
  const [compartiendoUbicacion, setCompartiendoUbicacion] = useState(false);
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
              Puedes compartir tu ubicación durante la procesión en tiempo real con tu cofradía.
            </Text>
            <TouchableOpacity
              style={[styles.ubicacionButton, compartiendoUbicacion && styles.ubicacionButtonActivo]}
              onPress={() => setCompartiendoUbicacion((actual) => !actual)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={compartiendoUbicacion ? 'checkmark-circle' : 'navigate-outline'}
                size={18}
                color={compartiendoUbicacion ? colors.lightGreenText : colors.background}
              />
              <Text style={[styles.ubicacionButtonTexto, compartiendoUbicacion && styles.ubicacionButtonTextoActivo]}>
                {compartiendoUbicacion ? 'Compartiendo ubicación' : 'Activar ubicación compartida'}
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

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={cerrarSesion} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
