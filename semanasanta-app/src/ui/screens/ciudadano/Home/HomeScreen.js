import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, ListItemCard, StatusBadge } from '../../../components/common';
import { useCiudad } from '../../../../application/context';
import {
  getCofradiasPorCiudad,
  getProcesionesPorCiudad,
  getProcesionEnCurso,
  getEventosPorCiudad,
  getDiasSemanaSanta,
  getAlertaDelDia,
} from '../../../../data/services';
import { formatearDuracion } from '../../../utils/tiempo';
import { colors } from '../../../../theme';
import { styles } from './HomeScreen.styles';

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

function formatearNumero(numero) {
  if (numero >= 1000) return `${Math.round(numero / 1000)}k`;
  return `${numero}`;
}

export function InicioScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();
  const [menuVisible, setMenuVisible] = useState(false);
  const [diaMenuVisible, setDiaMenuVisible] = useState(false);
  const [numCofradias, setNumCofradias] = useState(0);
  const [numProcesionesTotal, setNumProcesionesTotal] = useState(0);
  const [procesionEnCurso, setProcesionEnCurso] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [dias, setDias] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [favoritos, setFavoritos] = useState(new Set());

  const alternarFavorito = useCallback((id) => {
    setFavoritos((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(id)) {
        siguientes.delete(id);
      } else {
        siguientes.add(id);
      }
      return siguientes;
    });
  }, []);

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

      Promise.all([
        getCofradiasPorCiudad(ciudadId),
        getProcesionEnCurso(ciudadId),
        getProcesionesPorCiudad(ciudadId),
      ]).then(([cofradias, enCurso, procesiones]) => {
        setNumCofradias(cofradias.length);
        setNumProcesionesTotal(procesiones.length);
        if (enCurso) {
          const cofradia = cofradias.find((c) => c.id === enCurso.cofradiaId);
          setProcesionEnCurso({ ...enCurso, cofradiaNombre: cofradia?.nombre });
        } else {
          setProcesionEnCurso(null);
        }
      });
    }, [ciudadSeleccionada])
  );

  useFocusEffect(
    useCallback(() => {
      if (!ciudadSeleccionada || !diaSeleccionado) return;
      const ciudadId = ciudadSeleccionada.id;

      getAlertaDelDia(ciudadId, diaSeleccionado.nombre).then(setAlerta);

      Promise.all([
        getProcesionesPorCiudad(ciudadId),
        getEventosPorCiudad(ciudadId),
        getCofradiasPorCiudad(ciudadId),
      ]).then(([procesiones, eventos, cofradias]) => {
        const nombrePorCofradiaId = Object.fromEntries(cofradias.map((c) => [c.id, c.nombre]));
        const items = [
          ...procesiones
            .filter((p) => p.dia === diaSeleccionado.nombre)
            .map((p) => ({ ...p, categoria: 'procesion', cofradiaNombre: nombrePorCofradiaId[p.cofradiaId] })),
          ...eventos
            .filter((e) => e.fecha === diaSeleccionado.fecha)
            .map((e) => ({ ...e, categoria: 'evento', cofradiaNombre: nombrePorCofradiaId[e.cofradiaId] })),
        ];
        setAgenda(items);
      });
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
    // los eventos no tienen pantalla de detalle todavía (se añadirá en una iteración posterior)
  }

  function abrirAlerta() {
    if (alerta?.procesionId) {
      navigation.navigate('DetalleProcesion', { procesionId: alerta.procesionId });
    } else if (alerta?.eventoId) {
      // los eventos no tienen pantalla de detalle todavía (se añadirá en una iteración posterior)
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
              <Octicons name="location" size={14} color={colors.gold} />
              <Text style={styles.ciudad}>{ciudadSeleccionada.nombre}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.gold} />
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

        {alerta ? (
          <TouchableOpacity style={styles.avisoCard} onPress={abrirAlerta} activeOpacity={0.8}>
            <Ionicons name="alarm-outline" size={20} color={colors.cream} />
            <Text style={styles.avisoTexto} numberOfLines={2}>
              {alerta.texto}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.cream} />
          </TouchableOpacity>
        ) : null}

        {procesionEnCurso ? (
          <>
            <Text style={styles.sectionTitle}>En curso ahora</Text>
            <View style={styles.enCursoCard}>
            <View style={styles.enCursoLeft}>
              <StatusBadge estado="EN_CURSO" />
              <Text style={styles.enCursoTitle}>{procesionEnCurso.nombre}</Text>
              <Text style={styles.enCursoMeta}>{procesionEnCurso.cofradiaNombre}</Text>
            </View>
            <View style={styles.enCursoRight}>
              <Text style={styles.enCursoHora}>{procesionEnCurso.horaSalida}</Text>
              <Text style={styles.enCursoDuracion}>{formatearDuracion(procesionEnCurso.duracionMin)}</Text>
            </View>
            </View>
          </>
        ) : null}

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="church" size={22} color={colors.subtitle} />
            <Text style={styles.statValue}>{numCofradias}</Text>
            <Text style={styles.statLabel}>Cofradías</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="cross" size={22} color={colors.subtitle} />
            <Text style={styles.statValue}>{numProcesionesTotal}</Text>
            <Text style={styles.statLabel}>Procesiones</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="candle" size={22} color={colors.subtitle} />
            <Text style={styles.statValue}>{formatearNumero(ciudadSeleccionada.numCofrades ?? 0)}</Text>
            <Text style={styles.statLabel}>Cofrades</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Procesiones y eventos de hoy</Text>
        {agenda.map((item) => (
          <ListItemCard
            key={`${item.categoria}-${item.id}`}
            icon={item.categoria === 'procesion' ? 'cross' : 'candle'}
            title={item.nombre}
            subtitle={item.cofradiaNombre}
            hora={item.categoria === 'procesion' ? item.horaSalida : null}
            badge={<StatusBadge estado={item.estado} />}
            mostrarFavorito
            esFavorito={favoritos.has(item.id)}
            onToggleFavorito={() => alternarFavorito(item.id)}
            onPress={() => abrirAgendaItem(item)}
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
