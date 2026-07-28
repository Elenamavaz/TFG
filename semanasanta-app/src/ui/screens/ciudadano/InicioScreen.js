import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { ListItemCard } from '../../components/common/ListItemCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useCiudad } from '../../../application/context/CiudadContext';
import { getCofradiasPorCiudad } from '../../../data/services/cofradiaService';
import { getProcesionesPorCiudad, getProcesionEnCurso } from '../../../data/services/procesionService';
import { getEventosPorCiudad } from '../../../data/services/eventoService';
import { getDiasSemanaSanta } from '../../../data/services/diaService';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

const OPCIONES_MENU = [
  { tipo: 'cofradias', label: 'Cofradías' },
  { tipo: 'procesiones', label: 'Procesiones' },
  { tipo: 'pasos', label: 'Pasos' },
  { tipo: 'eventos', label: 'Eventos' },
];

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function formatearFechaCorta(fechaIso) {
  const [, mes, dia] = fechaIso.split('-').map(Number);
  return `${dia} de ${MESES[mes - 1]}`;
}

export function InicioScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const [menuVisible, setMenuVisible] = useState(false);
  const [diaMenuVisible, setDiaMenuVisible] = useState(false);
  const [numCofradias, setNumCofradias] = useState(0);
  const [numProcesionesTotal, setNumProcesionesTotal] = useState(0);
  const [procesionEnCurso, setProcesionEnCurso] = useState(null);
  const [dias, setDias] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [agenda, setAgenda] = useState([]);

  useEffect(() => {
    getDiasSemanaSanta().then((lista) => {
      setDias(lista);
      const hoy = new Date().toISOString().slice(0, 10);
      setDiaSeleccionado(lista.find((d) => d.fecha === hoy) ?? lista[0]);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!ciudadSeleccionada) return;
      const ciudadId = ciudadSeleccionada.id;

      getCofradiasPorCiudad(ciudadId).then((cofradias) => setNumCofradias(cofradias.length));
      getProcesionEnCurso(ciudadId).then(setProcesionEnCurso);
      getProcesionesPorCiudad(ciudadId).then((procesiones) => setNumProcesionesTotal(procesiones.length));
    }, [ciudadSeleccionada])
  );

  useFocusEffect(
    useCallback(() => {
      if (!ciudadSeleccionada || !diaSeleccionado) return;
      const ciudadId = ciudadSeleccionada.id;

      Promise.all([getProcesionesPorCiudad(ciudadId), getEventosPorCiudad(ciudadId)]).then(
        ([procesiones, eventos]) => {
          const items = [
            ...procesiones
              .filter((p) => p.dia === diaSeleccionado.nombre)
              .map((p) => ({ ...p, categoria: 'procesion' })),
            ...eventos
              .filter((e) => e.fecha === diaSeleccionado.fecha)
              .map((e) => ({ ...e, categoria: 'evento' })),
          ];
          setAgenda(items);
        }
      );
    }, [ciudadSeleccionada, diaSeleccionado])
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

  function seleccionarDia(dia) {
    setDiaSeleccionado(dia);
    setDiaMenuVisible(false);
  }

  if (!ciudadSeleccionada || !diaSeleccionado) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <TouchableOpacity
              style={styles.ciudadRow}
              onPress={() => navigation.getParent()?.navigate('SeleccionCiudad')}
              activeOpacity={0.8}
            >
              <Octicons name="location" size={14} color={colors.goldMuted} />
              <Text style={styles.ciudad}>{ciudadSeleccionada.nombre}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.goldMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.diaRow} onPress={() => setDiaMenuVisible(true)} activeOpacity={0.8}>
              <Text style={styles.title}>{diaSeleccionado.nombre}</Text>
              <Ionicons name="chevron-down" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.subtitle}>
              {formatearFechaCorta(diaSeleccionado.fecha)} · {agenda.filter((a) => a.categoria === 'procesion').length} procesiones
            </Text>
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
            <Text style={styles.statValue}>{numProcesionesTotal}</Text>
            <Text style={styles.statLabel}>Procesiones</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Procesiones y eventos de {diaSeleccionado.nombre.toLowerCase()}</Text>
        {agenda.map((item) => (
          <ListItemCard
            key={`${item.categoria}-${item.id}`}
            title={item.nombre}
            subtitle={item.categoria === 'procesion' ? item.horaSalida : null}
            badge={<StatusBadge estado={item.estado} />}
            onPress={() => abrirAgendaItem(item)}
            rightIcon={item.categoria === 'procesion' ? 'chevron-forward' : null}
          />
        ))}
        {agenda.length === 0 ? (
          <Text style={styles.empty}>No hay procesiones ni eventos registrados este día.</Text>
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

      <Modal transparent visible={diaMenuVisible} animationType="fade" onRequestClose={() => setDiaMenuVisible(false)}>
        <Pressable style={styles.overlayCenter} onPress={() => setDiaMenuVisible(false)}>
          <View style={styles.diaMenu}>
            {dias.map((dia) => (
              <TouchableOpacity
                key={dia.id}
                style={[styles.diaMenuItem, dia.id === diaSeleccionado.id && styles.diaMenuItemActivo]}
                onPress={() => seleccionarDia(dia)}
              >
                <Text style={[styles.diaMenuItemText, dia.id === diaSeleccionado.id && styles.diaMenuItemTextActivo]}>
                  {dia.nombre}
                </Text>
                <Text style={styles.diaMenuItemFecha}>{formatearFechaCorta(dia.fecha)}</Text>
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
  headerText: {
    flex: 1,
  },
  ciudadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ciudad: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  diaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 32,
  },
  subtitle: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
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
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  diaMenu: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: 320,
  },
  diaMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  diaMenuItemActivo: {
    backgroundColor: colors.surface,
  },
  diaMenuItemText: {
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
  diaMenuItemTextActivo: {
    color: colors.gold,
  },
  diaMenuItemFecha: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
  },
});
