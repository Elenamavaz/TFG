import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ListItemCard } from '../../components/common/ListItemCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useCiudad } from '../../../application/context/CiudadContext';
import { getCofradiasPorCiudad } from '../../../data/services/cofradiaService';
import { getProcesionesPorCiudad, getProcesionEnCurso } from '../../../data/services/procesionService';
import { getEventosPorCiudad } from '../../../data/services/eventoService';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

const OPCIONES_MENU = [
  { tipo: 'cofradias', label: 'Cofradías' },
  { tipo: 'procesiones', label: 'Procesiones' },
  { tipo: 'pasos', label: 'Pasos' },
  { tipo: 'eventos', label: 'Eventos' },
];

export function InicioScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const [menuVisible, setMenuVisible] = useState(false);
  const [numCofradias, setNumCofradias] = useState(0);
  const [procesionEnCurso, setProcesionEnCurso] = useState(null);
  const [agenda, setAgenda] = useState([]);

  useFocusEffect(
    useCallback(() => {
      if (!ciudadSeleccionada) return;
      const ciudadId = ciudadSeleccionada.id;

      getCofradiasPorCiudad(ciudadId).then((cofradias) => setNumCofradias(cofradias.length));
      getProcesionEnCurso(ciudadId).then(setProcesionEnCurso);
      Promise.all([getProcesionesPorCiudad(ciudadId), getEventosPorCiudad(ciudadId)]).then(
        ([procesiones, eventos]) => {
          const items = [
            ...procesiones.map((p) => ({ ...p, categoria: 'procesion' })),
            ...eventos.map((e) => ({ ...e, categoria: 'evento' })),
          ];
          setAgenda(items);
        }
      );
    }, [ciudadSeleccionada])
  );

  function abrirListado(tipo) {
    setMenuVisible(false);
    navigation.navigate('Listado', { tipo });
  }

  function abrirAgendaItem(item) {
    if (item.categoria === 'procesion') {
      navigation.navigate('DetalleProcesion', { procesionId: item.id });
    }
  }

  if (!ciudadSeleccionada) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.ciudad}>📍 {ciudadSeleccionada.nombre}</Text>
            <Text style={styles.title}>Semana Santa</Text>
          </View>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={colors.gold} />
          </TouchableOpacity>
        </View>

        {procesionEnCurso ? (
          <View style={styles.enCursoCard}>
            <StatusBadge estado="EN_CURSO" />
            <Text style={styles.enCursoTitle}>{procesionEnCurso.nombre}</Text>
            <Text style={styles.enCursoMeta}>
              Salida {procesionEnCurso.horaSalida} · {procesionEnCurso.dia}
            </Text>
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{numCofradias}</Text>
            <Text style={styles.statLabel}>Cofradías</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{agenda.filter((a) => a.categoria === 'procesion').length}</Text>
            <Text style={styles.statLabel}>Procesiones</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Procesiones y eventos</Text>
        {agenda.map((item) => (
          <ListItemCard
            key={`${item.categoria}-${item.id}`}
            title={item.nombre}
            subtitle={item.categoria === 'procesion' ? item.dia : null}
            badge={<StatusBadge estado={item.estado} />}
            onPress={() => abrirAgendaItem(item)}
            rightIcon={item.categoria === 'procesion' ? 'chevron-forward' : null}
          />
        ))}
        {agenda.length === 0 ? (
          <Text style={styles.empty}>No hay procesiones ni eventos registrados todavía.</Text>
        ) : null}
      </ScrollView>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            {OPCIONES_MENU.map((opcion) => (
              <TouchableOpacity key={opcion.tipo} style={styles.menuItem} onPress={() => abrirListado(opcion.tipo)}>
                <Text style={styles.menuItemText}>{opcion.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  ciudad: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 32,
    marginTop: spacing.xs,
  },
  menuButton: {
    padding: spacing.xs,
  },
  enCursoCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  enCursoTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 22,
    marginTop: spacing.xs,
  },
  enCursoMeta: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: colors.gold,
    fontFamily: fontFamilies.titleBold,
    fontSize: 24,
  },
  statLabel: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 20,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: spacing.lg,
  },
  menu: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    minWidth: 180,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
});
