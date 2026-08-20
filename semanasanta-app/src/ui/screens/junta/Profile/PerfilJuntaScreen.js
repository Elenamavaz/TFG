import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../../application/context';
import {
  getMiembroJuntaCofradiaPorId,
  getJuntaCofradiasPorId,
  getCiudadPorId,
  getCofradiasPorCiudad,
  getProcesionesPorCiudad,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './PerfilJuntaScreen.styles';

// "Próximamente" a propósito: solo Editar perfil tiene mockup completo
// todavía (2026-08-18) -Cofradías/Procesiones/Eventos/Pasos son la lista de
// Gestión del mockup, pero sin pantallas de alta/edición propias aún, ver
// memoria del TFG (mismo criterio que el resto del panel Admin: no se
// construye una sección a medias).
const OPCIONES_GESTION = [
  { id: 'cofradias', icono: 'church', titulo: 'Cofradias', subtitulo: 'Crear, editar y eliminar cofradias', ruta: null },
  { id: 'procesiones', icono: 'walk', titulo: 'Procesiones', subtitulo: 'Crear, editar y eliminar procesiones', ruta: null },
  { id: 'eventos', icono: 'calendar-star', titulo: 'Eventos', subtitulo: 'Crear, editar y eliminar eventos', ruta: null },
  { id: 'pasos', icono: 'cross', titulo: 'Pasos', subtitulo: 'Crear, editar y eliminar pasos', ruta: null },
  {
    id: 'perfil',
    icono: 'account-edit-outline',
    titulo: 'Editar perfil',
    subtitulo: 'Modificar datos del perfil',
    ruta: 'EditarPerfilJunta',
  },
];

// Punto de entrada del panel de Junta (mockup del 2026-08-18): antes de esto
// un login de Junta activo caía en PanelProximamenteScreen -ya no existe,
// esto es el panel real. Sin barra de pestañas inferior a propósito (Elena:
// "si quieren consultar información como un ciudadano que cierren sesión y
// entren como ciudadano") -mismo criterio que el panel de Administrador.
export function PerfilJuntaScreen({ navigation }) {
  const { sesion, cerrarSesion } = useAuth();
  const [ciudad, setCiudad] = useState(null);
  const [numProcesiones, setNumProcesiones] = useState(0);
  const [numCofradias, setNumCofradias] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getMiembroJuntaCofradiaPorId(sesion.usuarioId)
        .then((miembro) => getJuntaCofradiasPorId(miembro.juntaCofradiasId))
        .then((junta) => getCiudadPorId(junta.ciudadId))
        .then((ciudadCargada) => {
          setCiudad(ciudadCargada);
          return Promise.all([getCofradiasPorCiudad(ciudadCargada.id), getProcesionesPorCiudad(ciudadCargada.id)]);
        })
        .then(([cofradias, procesiones]) => {
          setNumCofradias(cofradias.length);
          setNumProcesiones(procesiones.length);
        });
    }, [sesion.usuarioId])
  );

  function abrirOpcion(opcion) {
    if (!opcion.ruta) return;
    navigation.navigate(opcion.ruta);
  }

  async function salir() {
    cerrarSesion();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        <Text style={styles.sectionTitle}>Rol</Text>
        <View style={styles.rolCard}>
          <View style={styles.rolBadge}>
            <Ionicons name="person" size={16} color={colors.gold} />
            <Text style={styles.rolBadgeTexto}>Miembro de la Junta de Cofradias</Text>
          </View>
          <Text style={styles.rolDescripcion}>Gestionas las cofradías, pasos, procesiones y eventos de tu ciudad.</Text>
        </View>

        <Text style={styles.sectionTitle}>Ciudad gestionada</Text>
        {ciudad ? (
          <View style={styles.ciudadCard}>
            <Ionicons name="location-outline" size={22} color={colors.gold} />
            <View>
              <Text style={styles.ciudadNombre}>{ciudad.nombre}</Text>
              <Text style={styles.ciudadMeta}>
                {numProcesiones} procesiones · {numCofradias} cofradías
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Gestión</Text>
        {OPCIONES_GESTION.map((opcion) => (
          <TouchableOpacity
            key={opcion.id}
            style={[styles.opcionRow, !opcion.ruta && styles.opcionRowDeshabilitada]}
            onPress={() => abrirOpcion(opcion)}
            activeOpacity={opcion.ruta ? 0.8 : 1}
            disabled={!opcion.ruta}
          >
            <View style={styles.opcionIcono}>
              <MaterialCommunityIcons name={opcion.icono} size={20} color={colors.gold} />
            </View>
            <View style={styles.opcionTextBlock}>
              <Text style={styles.opcionTitulo}>{opcion.titulo}</Text>
              <Text style={styles.opcionSubtitulo}>
                {opcion.ruta ? opcion.subtitulo : `${opcion.subtitulo} · Próximamente`}
              </Text>
            </View>
            {opcion.ruta ? <Ionicons name="chevron-forward" size={18} color={colors.subtitle} /> : null}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.cerrarSesionButton} onPress={salir} activeOpacity={0.85}>
          <Text style={styles.cerrarSesionTexto}>Cerrar Sesion</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
