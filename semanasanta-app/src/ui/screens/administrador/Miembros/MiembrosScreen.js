import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getJuntasCofradias,
  getMiembrosDeJunta,
  actualizarMiembroJuntaCofradia,
  reenviarInvitacion,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './MiembrosScreen.styles';

const COLOR_POR_ESTADO = {
  Activa: { background: colors.greenBackground, texto: colors.lightGreenText },
  Pendiente: { background: colors.backgroundOrange, texto: colors.orangeText },
  Desactivado: { background: colors.backgroundRed, texto: colors.redText },
};

// "Pendiente"/"Activa"/"Desactivado" no son un campo del backend por
// separado -se calculan a partir de activo/passwordProvisional (mockup del
// 2026-08-17): Desactivado gana siempre, Pendiente es "activo pero sin
// terminar el alta" (no ha cambiado la contraseña provisional que se le
// mandó por correo, ver MiembroJuntaCofradia.passwordProvisional).
function estadoDe(miembro) {
  if (!miembro.activo) return 'Desactivado';
  if (miembro.passwordProvisional) return 'Pendiente';
  return 'Activa';
}

function EstadoBadge({ estado }) {
  const color = COLOR_POR_ESTADO[estado];
  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <Text style={[styles.badgeTexto, { color: color.texto }]}>{estado}</Text>
    </View>
  );
}

function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

// Punto de entrada de "Miembros" (mockup del 2026-08-17, ampliado el
// 2026-08-21 con el filtro "Junta:"): dos formas de llegar aquí, mismo
// componente para las dos -
// (1) "Miembros de las Juntas" en Mi Perfil, sin juntaId por params -lista
//     TODAS las Juntas con "Junta: Todos" preseleccionado (agregado en
//     cliente, sin endpoint nuevo: un GET /juntas-cofradias/{id}/miembros
//     por Junta, mismo patrón de Promise.all que ya usa CiudadesScreen -no
//     compensa un endpoint "todos los miembros" solo para esto).
// (2) "Equipo → Ver Lista" de una Junta concreta, con juntaId por params
//     -entra con esa Junta preseleccionada en el filtro (se puede cambiar a
//     "Todos" u otra desde ahí mismo, no queda atado).
export function MiembrosScreen({ route, navigation }) {
  const juntaIdInicial = route.params?.juntaId ?? null;
  const [juntas, setJuntas] = useState([]);
  const [filtroJuntaId, setFiltroJuntaId] = useState(juntaIdInicial); // null = "Todos"
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [miembros, setMiembros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Miembros',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    getJuntasCofradias().then((listaJuntas) => {
      setJuntas(listaJuntas);
      const juntasAConsultar = filtroJuntaId ? listaJuntas.filter((j) => j.id === filtroJuntaId) : listaJuntas;
      Promise.all(juntasAConsultar.map((j) => getMiembrosDeJunta(j.id))).then((listas) => {
        setMiembros(listas.flat());
        setCargando(false);
      });
    });
  }, [filtroJuntaId]);

  useFocusEffect(cargar);

  const juntaFiltro = juntas.find((j) => j.id === filtroJuntaId);

  async function alternarActivo(miembro) {
    if (procesandoId) return;
    setProcesandoId(miembro.id);
    try {
      await actualizarMiembroJuntaCofradia(miembro.id, {
        nombre: miembro.nombre,
        email: miembro.email,
        telefono: miembro.telefono,
        juntaCofradiasId: miembro.juntaCofradiasId,
        activo: !miembro.activo,
      });
      cargar();
    } finally {
      setProcesandoId(null);
    }
  }

  async function reenviar(miembro) {
    if (procesandoId) return;
    setProcesandoId(miembro.id);
    try {
      await reenviarInvitacion(miembro.id);
      cargar();
    } finally {
      setProcesandoId(null);
    }
  }

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Miembros</Text>
        <Text style={styles.subtitle}>
          {juntaFiltro ? `Junta de Cofradías de ${juntaFiltro.nombre}` : 'Todas las Juntas de Cofradías'}
        </Text>

        {/* Sin Junta elegida en el filtro ("Todos"), FormularioMiembroScreen
            se abre con su propio selector de Junta vacío -ya no hace falta
            forzar un filtro concreto aquí para poder añadir. */}
        <TouchableOpacity
          style={styles.nuevoButton}
          onPress={() => navigation.navigate('FormularioMiembro', { juntaId: filtroJuntaId })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevoButtonTexto}>Añadir miembro</Text>
        </TouchableOpacity>

        <View style={styles.filtroRow}>
          <Text style={styles.filtroEtiqueta}>Junta:</Text>
          <TouchableOpacity style={styles.filtroSelector} onPress={() => setModalFiltroVisible(true)} activeOpacity={0.8}>
            <Text style={styles.filtroTexto} numberOfLines={1}>
              {juntaFiltro ? juntaFiltro.nombre : 'Todos'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.subtitle} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Lista de miembros actuales</Text>
        {miembros.map((miembro) => {
          const estado = estadoDe(miembro);
          return (
            <View key={miembro.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarTexto}>{iniciales(miembro.nombre)}</Text>
                </View>
                <Text style={styles.cardNombre}>{miembro.nombre}</Text>
                <EstadoBadge estado={estado} />
              </View>

              {estado === 'Pendiente' ? (
                <TouchableOpacity
                  style={styles.accionUnica}
                  disabled={procesandoId === miembro.id}
                  onPress={() => reenviar(miembro)}
                >
                  <Text style={styles.accionEditar}>Reenviar invitación</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.gold} />
                </TouchableOpacity>
              ) : (
                <View style={styles.cardAcciones}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('FormularioMiembro', { juntaId: miembro.juntaCofradiasId, miembroId: miembro.id })
                    }
                  >
                    <Text style={styles.accionEditar}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity disabled={procesandoId === miembro.id} onPress={() => alternarActivo(miembro)}>
                    <Text style={styles.accionDesactivar}>{miembro.activo ? 'Revocar acceso' : 'Activar acceso'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        {miembros.length === 0 ? (
          <Text style={styles.empty}>
            {juntaFiltro ? 'Esta Junta todavía no tiene miembros.' : 'Todavía no hay miembros en ninguna Junta.'}
          </Text>
        ) : null}
      </ScrollView>

      <Modal transparent visible={modalFiltroVisible} animationType="fade" onRequestClose={() => setModalFiltroVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalFiltroVisible(false)}>
          <View style={styles.modalLista}>
            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setFiltroJuntaId(null);
                setModalFiltroVisible(false);
              }}
            >
              <Text style={styles.modalItemTexto}>Todos</Text>
            </TouchableOpacity>
            {juntas.map((junta) => (
              <TouchableOpacity
                key={junta.id}
                style={styles.modalItem}
                onPress={() => {
                  setFiltroJuntaId(junta.id);
                  setModalFiltroVisible(false);
                }}
              >
                <Text style={styles.modalItemTexto}>{junta.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
