import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCiudadPorId, getCofradiasGestion, getEventosPorCiudad, eliminarEvento } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EventosScreen.styles';

const COLOR_POR_ESTADO = {
  Programada: { background: colors.backgroundOrange, texto: colors.orangeText },
  'En curso': { background: colors.greenBackground, texto: colors.lightGreenText },
  Finalizada: { background: colors.backgroundRed, texto: colors.redText },
  Cancelada: { background: colors.backgroundRed, texto: colors.redText },
};

// Mismo mapeo que ProcesionesScreen.ETIQUETA_POR_ESTADO -Evento comparte el
// mismo EstadoEvento del backend.
const ETIQUETA_POR_ESTADO = {
  PROGRAMADO: 'Programada',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizada',
  CANCELADO: 'Cancelada',
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

// Mockup del 2026-08-22: se llega desde "Eventos" del menú de Gestión en
// PerfilJuntaScreen, con ciudadId por params -mismo patrón que Procesiones.
// El mockup mostraba "Cancelar" como acción de cada fila (igual que
// Procesiones antes del 2026-08-22), pero EventoService no tiene ningún
// endpoint de cancelación todavía (su propio comentario lo dice: "estado no
// se toca aquí: lo cambiará un endpoint propio más adelante") -aquí se usa
// "Eliminar" en su lugar, que sí existe.
export function EventosScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [ciudad, setCiudad] = useState(null);
  const [cofradias, setCofradias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Eventos',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getCiudadPorId(ciudadId), getCofradiasGestion(ciudadId), getEventosPorCiudad(ciudadId)]).then(
      ([ciudadCargada, listaCofradias, listaEventos]) => {
        setCiudad(ciudadCargada);
        setCofradias(listaCofradias);
        setEventos(listaEventos);
        setCargando(false);
      }
    );
  }, [ciudadId]);

  useFocusEffect(cargar);

  function confirmarEliminar(evento) {
    Alert.alert('Eliminar evento', `¿Seguro que quieres eliminar "${evento.nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminandoId(evento.id);
          try {
            await eliminarEvento(evento.id);
            cargar();
          } finally {
            setEliminandoId(null);
          }
        },
      },
    ]);
  }

  const eventosFiltrados = filtroCofradiaId
    ? eventos.filter((e) => e.cofradiaIds.includes(filtroCofradiaId))
    : eventos;
  const cofradiaFiltro = cofradias.find((c) => c.id === filtroCofradiaId);

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Eventos</Text>
        <Text style={styles.subtitle}>{ciudad ? `Eventos de ${ciudad.nombre}` : ''}</Text>

        <TouchableOpacity
          style={styles.nuevaButton}
          onPress={() => navigation.navigate('FormularioEvento', { ciudadId })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevaButtonTexto}>Añadir evento</Text>
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

        <Text style={styles.sectionTitle}>Lista de eventos actuales</Text>
        {eventosFiltrados.map((evento) => (
          <View key={evento.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>{evento.nombre}</Text>
              <EstadoBadge estado={evento.estado} />
            </View>
            <Text style={styles.cardMeta}>{evento.dia ?? 'Sin día asignado'}</Text>
            <View style={styles.cardAcciones}>
              <TouchableOpacity onPress={() => navigation.navigate('FormularioEvento', { ciudadId, eventoId: evento.id })}>
                <Text style={styles.accionEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity disabled={eliminandoId === evento.id} onPress={() => confirmarEliminar(evento)}>
                <Text style={styles.accionEliminar}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {eventosFiltrados.length === 0 ? <Text style={styles.empty}>No hay eventos todavía.</Text> : null}
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
    </ScreenContainer>
  );
}
