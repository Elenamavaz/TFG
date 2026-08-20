import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCiudadPorId, getCofradiasPorCiudad, getProcesionesPorCiudad, cancelarProcesion } from '../../../../data/services';
import { Prioridad } from '../../../../data/models';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './ProcesionesScreen.styles';

// Mismo criterio de color que Notificacion.colorCategoria (ver HomeScreen):
// ALTA/URGENTE grave, MEDIA a medias, BAJA informativo.
const OPCIONES_PRIORIDAD = [
  { valor: Prioridad.BAJA, etiqueta: 'Baja', background: colors.greenBackground, texto: colors.lightGreenText },
  { valor: Prioridad.MEDIA, etiqueta: 'Media', background: colors.backgroundOrange, texto: colors.orangeText },
  { valor: Prioridad.ALTA, etiqueta: 'Alta', background: colors.backgroundRed, texto: colors.redText },
  { valor: Prioridad.URGENTE, etiqueta: 'Urgente', background: colors.backgroundRed, texto: colors.redText },
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
  const [filtroCofradiaId, setFiltroCofradiaId] = useState(null); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [procesandoId, setProcesandoId] = useState(null);
  const [procesionACancelar, setProcesionACancelar] = useState(null); // null = modal cerrado
  const [mensajeCancelar, setMensajeCancelar] = useState('');
  const [prioridadCancelar, setPrioridadCancelar] = useState(null);

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

  function abrirCancelar(procesion) {
    setProcesionACancelar(procesion);
    setMensajeCancelar('');
    setPrioridadCancelar(null);
  }

  function cerrarCancelar() {
    if (procesandoId) return; // no cerrar a medio guardar
    setProcesionACancelar(null);
  }

  async function confirmarCancelar() {
    if (!prioridadCancelar || procesandoId) return;
    setProcesandoId(procesionACancelar.id);
    try {
      await cancelarProcesion(procesionACancelar.id, { mensaje: mensajeCancelar.trim(), prioridad: prioridadCancelar });
      setProcesionACancelar(null);
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
              <TouchableOpacity disabled={procesandoId === procesion.id} onPress={() => abrirCancelar(procesion)}>
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

      <Modal transparent visible={procesionACancelar !== null} animationType="fade" onRequestClose={cerrarCancelar}>
        <Pressable style={styles.overlay} onPress={cerrarCancelar}>
          <Pressable style={styles.modalCancelar} onPress={() => {}}>
            <Text style={styles.modalCancelarTitulo}>Cancelar procesión</Text>
            <Text style={styles.modalCancelarSubtitulo}>
              {procesionACancelar ? `Se avisará a los ciudadanos de que "${procesionACancelar.nombre}" se cancela.` : ''}
            </Text>

            <Text style={styles.etiquetaCancelar}>Motivo (opcional)</Text>
            <TextInput
              style={[styles.inputCancelar, styles.inputCancelarMultilinea]}
              value={mensajeCancelar}
              onChangeText={setMensajeCancelar}
              placeholder="Ej. corte de calle por aforo"
              placeholderTextColor={colors.subtitle}
              multiline
            />

            <Text style={styles.etiquetaCancelar}>Prioridad</Text>
            <View style={styles.prioridadRow}>
              {OPCIONES_PRIORIDAD.map((opcion) => {
                const seleccionada = prioridadCancelar === opcion.valor;
                return (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[
                      styles.prioridadChip,
                      { backgroundColor: opcion.background },
                      seleccionada && { borderColor: opcion.texto },
                    ]}
                    onPress={() => setPrioridadCancelar(opcion.valor)}
                  >
                    <Text style={[styles.prioridadChipTexto, { color: opcion.texto }]}>{opcion.etiqueta}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalCancelarAcciones}>
              <TouchableOpacity style={styles.volverButton} onPress={cerrarCancelar} disabled={procesandoId !== null}>
                <Text style={styles.volverTexto}>Volver</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmarCancelarButton, !prioridadCancelar && styles.botonDeshabilitado]}
                onPress={confirmarCancelar}
                disabled={!prioridadCancelar || procesandoId !== null}
              >
                <Text style={styles.confirmarCancelarTexto}>Confirmar cancelación</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
