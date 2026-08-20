import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCiudadPorId, getCofradiasPorCiudad, getProcesionesPorCiudad, cancelarProcesion } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './ProcesionesScreen.styles';

const COLOR_POR_ESTADO = {
  Programada: { background: colors.backgroundOrange, texto: colors.orangeText },
  'En curso': { background: colors.greenBackground, texto: colors.lightGreenText },
  Finalizada: { background: colors.backgroundRed, texto: colors.redText },
  Cancelada: { background: colors.backgroundRed, texto: colors.redText },
};

// "Programada"/"En curso"/"Finalizada"/"Cancelada" son la traducción visual
// del EstadoEvento del backend (PROGRAMADO/EN_CURSO/FINALIZADO/CANCELADO,
// masculino porque Procesion lo hereda de Evento) -mismo patrón que
// EstadoBadge en Ciudades/Juntas/Miembros.
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

// Mockup del 2026-08-20: se llega desde "Procesiones" del menú de Gestión en
// PerfilJuntaScreen, con ciudadId por params -es la misma ciudad de la Junta
// que ha iniciado sesión, no hace falta elegirla.
export function ProcesionesScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [ciudad, setCiudad] = useState(null);
  const [cofradias, setCofradias] = useState([]);
  const [procesiones, setProcesiones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Procesiones',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getCiudadPorId(ciudadId), getCofradiasPorCiudad(ciudadId), getProcesionesPorCiudad(ciudadId)]).then(
      ([ciudadCargada, listaCofradias, listaProcesiones]) => {
        setCiudad(ciudadCargada);
        setCofradias(listaCofradias);
        setProcesiones(listaProcesiones);
        setCargando(false);
      }
    );
  }, [ciudadId]);

  useFocusEffect(cargar);

  async function cancelar(procesion) {
    if (procesandoId) return;
    setProcesandoId(procesion.id);
    try {
      await cancelarProcesion(procesion.id);
      cargar();
    } finally {
      setProcesandoId(null);
    }
  }

  const procesionesFiltradas = filtroCofradiaId
    ? procesiones.filter((p) => p.cofradiaIds.includes(filtroCofradiaId))
    : procesiones;
  const cofradiaFiltro = cofradias.find((c) => c.id === filtroCofradiaId);

  if (cargando) return null;

  return (
    <ScreenContainer>
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
              <TouchableOpacity disabled={procesandoId === procesion.id} onPress={() => cancelar(procesion)}>
                <Text style={styles.accionCancelar}>Cancelar</Text>
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
    </ScreenContainer>
  );
}
