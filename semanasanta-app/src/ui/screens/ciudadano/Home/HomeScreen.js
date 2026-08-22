import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions, FlatList, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, Octicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer, ListItemCard, StatusBadge } from '../../../components/common';
import { useCiudad, useDia, useFavoritos } from '../../../../application/context';
import {
  getCofradiasPorCiudad,
  getProcesionesPorCiudad,
  getProcesionEnCurso,
  getEventosPorCiudad,
  getDiasSemanaSanta,
  getNotificacionesActivas,
  getNotificacionesDescartadasIds,
  descartarNotificacion,
} from '../../../../data/services';
import { formatearDuracion, MESES } from '../../../utils/tiempo';
import { colors, spacing } from '../../../../theme';
import { styles } from './HomeScreen.styles';

const OPCIONES_MENU = [
  { tipo: 'cofradias', label: 'Cofradías', icon: 'account-multiple' },
  { tipo: 'procesiones', label: 'Procesiones', icon: 'candle' },
  { tipo: 'pasos', label: 'Pasos', icon: 'cross' },
  { tipo: 'eventos', label: 'Eventos', icon: 'church' },
  { tipo: 'favoritos', label: 'Tus Favoritos', icon: 'heart-outline' },
];

// Tarjeta roja/naranja/verde según Notificacion.colorCategoria (decisión de
// Elena, 2026-08-15, generalizada el 2026-08-20 al colapsar Aviso/Alerta):
// ALTA grave, MEDIA a medias, BAJA/sin prioridad informativo.
const COLOR_POR_CATEGORIA = {
  roja: { background: colors.backgroundRed, border: colors.borderRed, icono: colors.redText },
  naranja: { background: colors.backgroundOrange, border: colors.borderOrange, icono: colors.orangeText },
  verde: { background: colors.greenBackground, border: colors.greenBorder, icono: colors.lightGreenText },
};

// Ancho de cada tarjeta = ancho de pantalla menos el padding horizontal del
// contenedor (styles.container, spacing.lg a cada lado): así cada "página"
// del carrusel ocupa el mismo hueco que ya ocupaba la tarjeta única de antes.
const ANCHO_TARJETA = Dimensions.get('window').width - spacing.lg * 2;

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
  const { diaSeleccionado, seleccionarDia: setDiaSeleccionado } = useDia();
  const [menuVisible, setMenuVisible] = useState(false);
  const [diaMenuVisible, setDiaMenuVisible] = useState(false);
  const [numCofradias, setNumCofradias] = useState(0);
  const [numProcesionesTotal, setNumProcesionesTotal] = useState(0);
  const [procesionEnCurso, setProcesionEnCurso] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [indiceNotificacion, setIndiceNotificacion] = useState(0);
  const [dias, setDias] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const { esFavorito, alternarFavorito } = useFavoritos();

  useEffect(() => {
    getDiasSemanaSanta().then((lista) => {
      setDias(lista);
      const hoy = new Date().toISOString().slice(0, 10);
      setDiaSeleccionado((actual) => actual ?? lista.find((d) => d.fecha === hoy) ?? lista[0]);
    });
  }, [setDiaSeleccionado]);

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
          const nombres = enCurso.cofradiaIds
            .map((id) => cofradias.find((c) => c.id === id)?.nombre)
            .filter(Boolean)
            .join(', ');
          setProcesionEnCurso({ ...enCurso, cofradiaNombre: nombres });
        } else {
          setProcesionEnCurso(null);
        }
      });

      // Las notificaciones ya no dependen del día seleccionado (el backend no
      // liga ninguna a un día de Semana Santa, ver alertaService): solo de la
      // ciudad. Las que el usuario ya descartó a mano (icono de papelera) no
      // se vuelven a mostrar -pero sí una nueva, si llega.
      Promise.all([getNotificacionesActivas(ciudadId), getNotificacionesDescartadasIds()]).then(
        ([activas, descartadasIds]) => {
          setNotificaciones(activas.filter((n) => !descartadasIds.includes(n.id)));
          setIndiceNotificacion(0);
        }
      );
    }, [ciudadSeleccionada])
  );

  useFocusEffect(
    useCallback(() => {
      if (!ciudadSeleccionada || !diaSeleccionado) return;
      const ciudadId = ciudadSeleccionada.id;

      Promise.all([
        getProcesionesPorCiudad(ciudadId),
        getEventosPorCiudad(ciudadId),
        getCofradiasPorCiudad(ciudadId),
      ]).then(([procesiones, eventos, cofradias]) => {
        const nombrePorCofradiaId = Object.fromEntries(cofradias.map((c) => [c.id, c.nombre]));
        // Un evento/procesión puede tener varias cofradías participantes
        // (N:M real en el backend): se muestran todas, separadas por coma.
        const nombresDeCofradias = (cofradiaIds) =>
          cofradiaIds.map((id) => nombrePorCofradiaId[id]).filter(Boolean).join(', ');
        const items = [
          ...procesiones
            .filter((p) => p.dia === diaSeleccionado.nombre)
            .map((p) => ({ ...p, categoria: 'procesion', cofradiaNombre: nombresDeCofradias(p.cofradiaIds) })),
          ...eventos
            .filter((e) => e.fecha === diaSeleccionado.fecha)
            .map((e) => ({
              ...e,
              categoria: 'evento',
              horaSalida: e.hora,
              cofradiaNombre: nombresDeCofradias(e.cofradiaIds),
            })),
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
    if (item.categoria === 'evento') {
      navigation.navigate('DetalleEvento', { eventoId: item.id });
    }
  }

  // Solo desaparece de este dispositivo (preferenciasService), no borra nada
  // en el backend -el ciudadano no tiene sesión ni permisos para eso.
  function descartarNotif(notificacion) {
    descartarNotificacion(notificacion.id);
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== notificacion.id));
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
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
              <Ionicons name="ellipsis-vertical" size={22} color={colors.gold} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('DetalleCiudad')}
              style={styles.infoButton}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={18} color={colors.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {notificaciones.length > 0 ? (
          <View style={styles.avisoCarrusel}>
            <FlatList
              data={notificaciones}
              keyExtractor={(item) => `${item.tipo}-${item.id}`}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={ANCHO_TARJETA + spacing.sm}
              decelerationRate="fast"
              contentContainerStyle={{ gap: spacing.sm }}
              onMomentumScrollEnd={(evento) => {
                const indice = Math.round(evento.nativeEvent.contentOffset.x / (ANCHO_TARJETA + spacing.sm));
                setIndiceNotificacion(indice);
              }}
              renderItem={({ item }) => {
                const color = COLOR_POR_CATEGORIA[item.colorCategoria];
                return (
                  <View
                    style={[
                      styles.avisoCard,
                      { width: ANCHO_TARJETA, backgroundColor: color.background, borderColor: color.border },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => descartarNotif(item)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={20} color={color.icono} />
                    </TouchableOpacity>
                    <Text style={styles.avisoTexto} numberOfLines={2}>
                      {item.titulo}
                    </Text>
                  </View>
                );
              }}
            />
            {notificaciones.length > 1 ? (
              <View style={styles.avisoDots}>
                {notificaciones.map((item, indice) => (
                  <View
                    key={`${item.tipo}-${item.id}`}
                    style={[styles.avisoDot, indice === indiceNotificacion && styles.avisoDotActivo]}
                  />
                ))}
              </View>
            ) : null}
          </View>
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
            <MaterialCommunityIcons name="church" size={24} color={colors.subtitle} />
            <Text style={styles.statValue}>{numCofradias}</Text>
            <Text style={styles.statLabel}>Cofradías</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="cross" size={24} color={colors.subtitle} />
            <Text style={styles.statValue}>{numProcesionesTotal}</Text>
            <Text style={styles.statLabel}>Procesiones</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="candle" size={24} color={colors.subtitle} />
            <Text style={styles.statValue}>{formatearNumero(ciudadSeleccionada.numCofrades ?? 0)}</Text>
            <Text style={styles.statLabel}>Cofrades</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Procesiones y eventos de hoy</Text>
        {agenda.map((item) => (
          <ListItemCard
            key={`${item.categoria}-${item.id}`}
            icon={item.categoria === 'procesion' ? 'candle' : 'church'}
            title={item.nombre}
            subtitle={item.cofradiaNombre}
            hora={item.horaSalida}
            badge={<StatusBadge estado={item.estado} />}
            mostrarFavorito
            esFavorito={esFavorito(item.id, item.categoria)}
            onToggleFavorito={() => alternarFavorito(item.id, item.categoria)}
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
                <MaterialCommunityIcons name={opcion.icon} size={20} color={colors.subtitle} />
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
