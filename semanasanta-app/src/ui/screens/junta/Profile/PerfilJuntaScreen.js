import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { styles } from './PerfilJuntaScreen.styles';

// Cofradías/Eventos/Pasos ya tienen pantallas reales desde el 2026-08-22
// (llegaron sus mockups de alta/edición propios -hasta entonces quedaban
// "Próximamente", mismo criterio que el resto del panel: no se construye
// una sección a medias).
const OPCIONES_GESTION = [
  {
    id: 'cofradias',
    icono: 'church',
    titulo: 'Cofradias',
    subtitulo: 'Crear, editar y eliminar cofradias',
    ruta: 'Cofradias',
  },
  {
    id: 'procesiones',
    icono: 'walk',
    titulo: 'Procesiones',
    subtitulo: 'Crear, editar y eliminar procesiones',
    ruta: 'Procesiones',
  },
  {
    id: 'eventos',
    icono: 'calendar-star',
    titulo: 'Eventos',
    subtitulo: 'Crear, editar y eliminar eventos',
    ruta: 'Eventos',
  },
  { id: 'pasos', icono: 'cross', titulo: 'Pasos', subtitulo: 'Crear, editar y eliminar pasos', ruta: 'Pasos' },
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
  const { sesion, cerrarSesion } = context.useAuth();
  const [ciudad, setCiudad] = useState(null);
  const [numProcesiones, setNumProcesiones] = useState(0);
  const [numCofradias, setNumCofradias] = useState(0);

  useFocusEffect(
    useCallback(() => {
      services.getMiembroJuntaCofradiaPorId(sesion.usuarioId)
        .then((miembro) => services.getJuntaCofradiasPorId(miembro.juntaCofradiasId))
        .then((junta) => services.getCiudadPorId(junta.ciudadId))
        .then((ciudadCargada) => {
          setCiudad(ciudadCargada);
          return Promise.all([services.getCofradiasPorCiudad(ciudadCargada.id), services.getProcesionesPorCiudad(ciudadCargada.id)]);
        })
        .then(([cofradias, procesiones]) => {
          setNumCofradias(cofradias.length);
          setNumProcesiones(procesiones.length);
        });
    }, [sesion.usuarioId])
  );

  function abrirOpcion(opcion) {
    if (!opcion.ruta) return;
    // Todas las secciones de gestión (Cofradias/Procesiones/Eventos/Pasos)
    // necesitan saber de qué ciudad -la misma que ya está resuelta aquí para
    // "Ciudad gestionada", no hace falta volver a elegirla. "Editar perfil"
    // es la única sin ciudadId, no la necesita.
    const necesitaCiudad = opcion.ruta !== 'EditarPerfilJunta';
    navigation.navigate(opcion.ruta, necesitaCiudad ? { ciudadId: ciudad?.id } : undefined);
  }

  async function salir() {
    cerrarSesion();
    navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>La Semana Santa de {ciudad?.nombre ?? ''}</Text>

        <Text style={styles.sectionTitle}>Rol</Text>
        <View style={styles.rolCard}>
          <View style={styles.rolBadge}>
            <Ionicons name="person" size={16} color={colors.gold} />
            <Text style={styles.rolBadgeTexto}>Miembro de la Junta de Cofradias</Text>
          </View>
          <Text style={styles.rolDescripcion}>Gestionas las cofradías, pasos, procesiones y eventos de tu ciudad.</Text>
        </View>

        <Text style={styles.sectionTitle}>Ciudad gestionada</Text>
        {/* Pulsable (2026-10-03, a petición de Elena): lleva a editar la
            historia y el patrimonio de la ciudad, igual que la opción
            "Información de la ciudad" de Gestión. */}
        {ciudad ? (
          <TouchableOpacity
            style={styles.ciudadCard}
            onPress={() => navigation.navigate('EditarInformacionCiudad', { ciudadId: ciudad.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="location-outline" size={22} color={colors.gold} />
            <View style={styles.ciudadTexto}>
              <Text style={styles.ciudadNombre}>{ciudad.nombre}</Text>
              <Text style={styles.ciudadMeta}>
                {numProcesiones} procesiones · {numCofradias} cofradías
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subtitle} />
          </TouchableOpacity>
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
    </common.ScreenContainer>
  );
}
