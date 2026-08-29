import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getCiudadPorId,
  getCofradiasPorCiudad,
  getProcesionesPorCiudad,
  cancelarProcesion,
  crearNotificacion,
} from '../../../../data/services';
import { Prioridad, TipoNotificacion } from '../../../../data/models';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './ProcesionesScreen.styles';

// Mismo criterio de color que Notificacion.colorCategoria (ver HomeScreen):
// ALTA grave, MEDIA a medias, BAJA informativo. Sin URGENTE desde el
// 2026-08-22 (ver Prioridad.java) -con estas tres queda completo.
const OPCIONES_PRIORIDAD = [
  { valor: Prioridad.BAJA, etiqueta: 'Baja', background: colors.greenBackground, texto: colors.lightGreenText },
  { valor: Prioridad.MEDIA, etiqueta: 'Media', background: colors.backgroundOrange, texto: colors.orangeText },
  { valor: Prioridad.ALTA, etiqueta: 'Alta', background: colors.backgroundRed, texto: colors.redText },
];

// "Notificar" (2026-08-20, unificado el 2026-08-22 en un solo botón/modal
// -antes "Notificar" y "Cancelar" eran dos acciones de fila separadas, a
// petición de Elena pasan a ser una sola con el tipo como primer paso).
// CANCELACION es distinta de las otras dos por dentro -además de la
// Notificacion, cambia el estado de la procesión (ver
// ProcesionService.cancelar, confirmarAccion la reconoce por tipo). INICIO/
// FIN no aparecen aquí -los genera el sistema, no la Junta a mano (ver
// NotificacionService.crear, que los rechaza explícitamente).
const OPCIONES_TIPO_ACCION = [
  { valor: TipoNotificacion.CANCELACION, etiqueta: 'Cancelar', prefijoTitulo: 'Cancelada' },
  { valor: TipoNotificacion.CAMBIO_HORARIO, etiqueta: 'Cambio de horario', prefijoTitulo: 'Cambio de horario' },
  { valor: TipoNotificacion.INCIDENCIA, etiqueta: 'Incidencia', prefijoTitulo: 'Incidencia' },
];

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
  // cofradiaIdInicial (opcional, 2026-08-23): llegando desde "Añadir
  // procesiones" en CofradiaCreadaScreen, con el filtro ya puesto en la
  // cofradía recién creada -mismo mecanismo que PasosScreen. El usuario
  // puede quitarlo igualmente, es solo el punto de partida.
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(route.params?.cofradiaIdInicial ?? null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [procesionAccion, setProcesionAccion] = useState(null); // null = modal cerrado
  const [tipoAccion, setTipoAccion] = useState(null);
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [prioridadAccion, setPrioridadAccion] = useState(null);

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

  function abrirAccion(procesion) {
    setProcesionAccion(procesion);
    setTipoAccion(null);
    setMensajeAccion('');
    setPrioridadAccion(null);
  }

  function cerrarAccion() {
    if (procesandoId) return; // no cerrar a medio guardar
    setProcesionAccion(null);
  }

  // CANCELACION es la única que además cambia el estado de la procesión (ver
  // ProcesionService.cancelar, que crea la Notificacion por dentro); las
  // otras dos son solo la Notificacion, vía POST /notificaciones genérico
  // -por eso solo CANCELACION recarga la lista al terminar (el badge de
  // estado cambia), y las otras no hacen falta.
  async function confirmarAccion() {
    if (!tipoAccion || !prioridadAccion || procesandoId) return;
    const opcion = OPCIONES_TIPO_ACCION.find((o) => o.valor === tipoAccion);
    const mensaje = mensajeAccion.trim();
    setProcesandoId(procesionAccion.id);
    try {
      if (tipoAccion === TipoNotificacion.CANCELACION) {
        await cancelarProcesion(procesionAccion.id, { mensaje, prioridad: prioridadAccion });
        cargar();
      } else {
        await crearNotificacion({
          titulo: `${opcion.prefijoTitulo}: ${procesionAccion.nombre}`,
          mensaje,
          ciudadId,
          tipo: tipoAccion,
          prioridad: prioridadAccion,
        });
      }
      setProcesionAccion(null);
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
              <TouchableOpacity disabled={procesandoId === procesion.id} onPress={() => abrirAccion(procesion)}>
                <Text style={styles.accionNotificar}>Notificar</Text>
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

      <Modal transparent visible={procesionAccion !== null} animationType="fade" onRequestClose={cerrarAccion}>
        <Pressable style={styles.overlay} onPress={cerrarAccion}>
          <Pressable style={styles.modalAccion} onPress={() => {}}>
            <Text style={styles.modalAccionTitulo}>Notificar</Text>
            <Text style={styles.modalAccionSubtitulo}>
              {procesionAccion
                ? `Este aviso será visible para los ciudadanos e informará de los cambios en "${procesionAccion.nombre}".`
                : ''}
            </Text>

            <Text style={styles.etiquetaModal}>Tipo</Text>
            <View style={styles.prioridadRow}>
              {OPCIONES_TIPO_ACCION.map((opcion) => {
                const seleccionado = tipoAccion === opcion.valor;
                return (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[
                      styles.prioridadChip,
                      { backgroundColor: colors.backgroundAlt, borderColor: colors.surfaceAlt },
                      seleccionado && { borderColor: colors.gold },
                    ]}
                    onPress={() => setTipoAccion(opcion.valor)}
                  >
                    <Text style={[styles.prioridadChipTexto, { color: seleccionado ? colors.gold : colors.cream }]}>
                      {opcion.etiqueta}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.etiquetaModal}>Motivos</Text>
            <TextInput
              style={[styles.inputModal, styles.inputModalMultilinea]}
              value={mensajeAccion}
              onChangeText={setMensajeAccion}
              placeholder="Ej. cancelación de la procesión por lluvias"
              placeholderTextColor={colors.subtitle}
              multiline
            />

            <Text style={styles.etiquetaModal}>Prioridad</Text>
            <View style={styles.prioridadRow}>
              {OPCIONES_PRIORIDAD.map((opcion) => {
                const seleccionada = prioridadAccion === opcion.valor;
                return (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[
                      styles.prioridadChip,
                      { backgroundColor: opcion.background },
                      seleccionada && { borderColor: opcion.texto },
                    ]}
                    onPress={() => setPrioridadAccion(opcion.valor)}
                  >
                    <Text style={[styles.prioridadChipTexto, { color: opcion.texto }]}>{opcion.etiqueta}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalAccionAcciones}>
              <TouchableOpacity style={styles.volverButton} onPress={cerrarAccion} disabled={procesandoId !== null}>
                <Text style={styles.volverTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmarNotificarButton, (!tipoAccion || !prioridadAccion) && styles.botonDeshabilitado]}
                onPress={confirmarAccion}
                disabled={!tipoAccion || !prioridadAccion || procesandoId !== null}
              >
                <Text style={styles.confirmarNotificarTexto}>Enviar notificaciones</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
