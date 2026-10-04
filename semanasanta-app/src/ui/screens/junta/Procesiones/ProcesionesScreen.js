import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { services } from '../../../../data';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { orden } from '../../../utils';
import { styles } from './ProcesionesScreen.styles';

const COLOR_POR_ESTADO = {
  Programado: { background: colors.backgroundOrange, texto: colors.orangeText },
  'En curso': { background: colors.greenBackground, texto: colors.lightGreenText },
  Finalizado: { background: colors.backgroundRed, texto: colors.redText },
  Cancelado: { background: colors.backgroundRed, texto: colors.redText },
};

// "Programado"/"En curso"/"Finalizado"/"Cancelado" son la traducción visual
// del EstadoEvento del backend (PROGRAMADO/EN_CURSO/FINALIZADO/CANCELADO,
// masculino porque Procesion lo hereda de Evento) -mismo patrón que
// EstadoBadge en Ciudades/Juntas/Miembros.
const ETIQUETA_POR_ESTADO = {
  PROGRAMADO: 'Programado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

function EstadoBadge({ estado }) {
  const etiqueta = ETIQUETA_POR_ESTADO[estado] ?? estado;
  const color = COLOR_POR_ESTADO[etiqueta];
  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <Text style={[styles.badgeTexto, { color: color.texto }]}>{etiqueta}</Text>
    </View>
  );
}

// Mockup del 2026-08-20: se llega desde "Procesiones" del menú de Gestión en
// PerfilJuntaScreen, con ciudadId por params -es la misma ciudad de la Junta
// que ha iniciado sesión, no hace falta elegirla.
export function ProcesionesScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [ciudad, setCiudad] = useState(null);
  const [cofradias, setCofradias] = useState([]);
  const [procesiones, setProcesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  // cofradiaIdInicial (opcional, 2026-08-23): llegando desde "Añadir
  // procesiones" en CofradiaCreadaScreen, con el filtro ya puesto en la
  // cofradía recién creada -mismo mecanismo que PasosScreen. El usuario
  // puede quitarlo igualmente, es solo el punto de partida.
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(route.params?.cofradiaIdInicial ?? null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Procesiones',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([services.getCiudadPorId(ciudadId), services.getCofradiasPorCiudad(ciudadId), services.getProcesionesPorCiudad(ciudadId)]).then(
      ([ciudadCargada, listaCofradias, listaProcesiones]) => {
        setCiudad(ciudadCargada);
        setCofradias(orden.ordenarPorNombre(listaCofradias));
        setProcesiones(orden.ordenarPorNombre(listaProcesiones));
        setCargando(false);
      }
    );
  }, [ciudadId]);

  useFocusEffect(cargar);

  // Sin acción "Notificar" en la lista desde el 2026-09-30: las
  // notificaciones (incluida la cancelación) se crean al terminar de editar,
  // desde "Crear Notificación" de ProcesionActualizadaScreen, y el paso a
  // En curso/Finalizado es automático (CambioEstadoAutomaticoService).
  const procesionesFiltradas = filtroCofradiaId
    ? procesiones.filter((p) => p.cofradiaIds.includes(filtroCofradiaId))
    : procesiones;
  const cofradiaFiltro = cofradias.find((c) => c.id === filtroCofradiaId);

  if (cargando) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Procesiones</Text>
        <Text style={styles.subtitle}>{ciudad ? `Procesiones de ${ciudad.nombre}` : ''}</Text>

        <TouchableOpacity
          style={styles.nuevaButton}
          onPress={() => navigation.navigate('FormularioProcesion', { ciudadId })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevaButtonTexto}>Añadir procesión</Text>
        </TouchableOpacity>

        <View style={styles.filtroRow}>
          <Text style={styles.filtroEtiqueta}>Cofradia:</Text>
          <TouchableOpacity style={styles.filtroSelector} onPress={() => setModalFiltroVisible(true)} activeOpacity={0.8}>
            <Text style={styles.filtroTexto} numberOfLines={1}>
              {cofradiaFiltro ? cofradiaFiltro.nombre : 'Todos'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.subtitle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Lista de procesiones actuales</Text>
        {procesionesFiltradas.map((procesion) => (
          <View key={procesion.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>{procesion.nombre}</Text>
              <EstadoBadge estado={procesion.estado} />
            </View>
            <Text style={styles.cardMeta}>{procesion.dia ?? 'Sin día asignado'}</Text>
            <View style={styles.cardAcciones}>
              <TouchableOpacity onPress={() => navigation.navigate('FormularioProcesion', { ciudadId, procesionId: procesion.id })}>
                <Text style={styles.accionEditar}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {procesionesFiltradas.length === 0 ? <Text style={styles.empty}>No hay procesiones todavía.</Text> : null}
      </ScrollView>

      <Modal transparent visible={modalFiltroVisible} animationType="fade" onRequestClose={() => setModalFiltroVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalFiltroVisible(false)}>
          <View style={styles.modalLista}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFiltroCofradiaId(null);
                setModalFiltroVisible(false);
              }}
            >
              <Text style={styles.modalItemTexto}>Todos</Text>
            </TouchableOpacity>
            {cofradias.map((cofradia) => (
              <TouchableOpacity
                key={cofradia.id}
                style={styles.modalItem}
                onPress={() => {
                  setFiltroCofradiaId(cofradia.id);
                  setModalFiltroVisible(false);
                }}
              >
                <Text style={styles.modalItemTexto}>{cofradia.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

    </common.ScreenContainer>
  );
}
