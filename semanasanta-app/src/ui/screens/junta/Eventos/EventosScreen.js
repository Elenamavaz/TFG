import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getCiudadPorId,
  getCofradiasGestion,
  getEventosPorCiudad,
  cancelarEvento,
  crearNotificacion,
} from '../../../../data/services';
import { Prioridad, TipoNotificacion } from '../../../../data/models';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EventosScreen.styles';

// Mismo criterio que ProcesionesScreen.OPCIONES_PRIORIDAD/OPCIONES_TIPO_ACCION.
const OPCIONES_PRIORIDAD = [
  { valor: Prioridad.BAJA, etiqueta: 'Baja', background: colors.greenBackground, texto: colors.lightGreenText },
  { valor: Prioridad.MEDIA, etiqueta: 'Media', background: colors.backgroundOrange, texto: colors.orangeText },
  { valor: Prioridad.ALTA, etiqueta: 'Alta', background: colors.backgroundRed, texto: colors.redText },
];

const OPCIONES_TIPO_ACCION = [
  { valor: TipoNotificacion.CANCELACION, etiqueta: 'Cancelar', prefijoTitulo: 'Cancelado' },
  { valor: TipoNotificacion.CAMBIO_HORARIO, etiqueta: 'Cambio de horario', prefijoTitulo: 'Cambio de horario' },
  { valor: TipoNotificacion.INCIDENCIA, etiqueta: 'Incidencia', prefijoTitulo: 'Incidencia' },
];

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
// "Notificar" (2026-08-23, mismo mecanismo que ProcesionesScreen desde el
// 2026-08-22): ya no hace falta el "Eliminar" que se puso aquí de parche
// mientras Evento no tenía endpoint de cancelación -ahora sí lo tiene (ver
// EventoService.cancelar). Eliminar (borrado real) sigue viviendo solo en
// FormularioEventoScreen, igual que en Procesiones.
export function EventosScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [ciudad, setCiudad] = useState(null);
  const [cofradias, setCofradias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  // cofradiaIdInicial (opcional, 2026-08-23): llegando desde "Añadir eventos"
  // en CofradiaCreadaScreen, con el filtro ya puesto en la cofradía recién
  // creada -mismo mecanismo que PasosScreen/ProcesionesScreen.
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(route.params?.cofradiaIdInicial ?? null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [eventoAccion, setEventoAccion] = useState(null); // null = modal cerrado
  const [tipoAccion, setTipoAccion] = useState(null);
  const [mensajeAccion, setMensajeAccion] = useState('');
  const [prioridadAccion, setPrioridadAccion] = useState(null);

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

  function abrirAccion(evento) {
    setEventoAccion(evento);
    setTipoAccion(null);
    setMensajeAccion('');
    setPrioridadAccion(null);
  }

  function cerrarAccion() {
    if (procesandoId) return; // no cerrar a medio guardar
    setEventoAccion(null);
  }

  // CANCELACION es la única que además cambia el estado del evento (ver
  // EventoService.cancelar, que crea la Notificacion por dentro); las otras
  // dos son solo la Notificacion, vía POST /notificaciones genérico -mismo
  // patrón que ProcesionesScreen.confirmarAccion.
  async function confirmarAccion() {
    if (!tipoAccion || !prioridadAccion || procesandoId) return;
    const opcion = OPCIONES_TIPO_ACCION.find((o) => o.valor === tipoAccion);
    const mensaje = mensajeAccion.trim();
    setProcesandoId(eventoAccion.id);
    try {
      if (tipoAccion === TipoNotificacion.CANCELACION) {
        await cancelarEvento(eventoAccion.id, { mensaje, prioridad: prioridadAccion });
        cargar();
      } else {
        await crearNotificacion({
          titulo: `${opcion.prefijoTitulo}: ${eventoAccion.nombre}`,
          mensaje,
          ciudadId,
          tipo: tipoAccion,
          prioridad: prioridadAccion,
        });
      }
      setEventoAccion(null);
    } finally {
      setProcesandoId(null);
    }
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
              <TouchableOpacity disabled={procesandoId === evento.id} onPress={() => abrirAccion(evento)}>
                <Text style={styles.accionNotificar}>Notificar</Text>
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

      <Modal transparent visible={eventoAccion !== null} animationType="fade" onRequestClose={cerrarAccion}>
        <Pressable style={styles.overlay} onPress={cerrarAccion}>
          <Pressable style={styles.modalAccion} onPress={() => {}}>
            <Text style={styles.modalAccionTitulo}>Notificar</Text>
            <Text style={styles.modalAccionSubtitulo}>
              {eventoAccion
                ? `Este aviso será visible para los ciudadanos e informará de los cambios en "${eventoAccion.nombre}".`
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
              placeholder="Ej. cambio de hora por lluvias"
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
