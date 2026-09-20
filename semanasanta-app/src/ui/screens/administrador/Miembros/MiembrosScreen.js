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
import { ordenarPorNombre } from '../../../utils/ordenarPorNombre';
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
// (1) "Miembros de las Juntas" en Mi Perfil, sin juntaId por params -entra
//     con la primera Junta por orden alfabético preseleccionada en el
//     filtro (cada ciudad tiene como mucho una Junta -relación 1:1, ver
//     JuntaCofradias.java-, así que no tiene sentido un "Todos" que mezcle
//     miembros de varias Juntas distintas: siempre se ve la lista de una
//     Junta concreta).
// (2) "Equipo → Ver Lista" de una Junta concreta, con juntaId por params
//     -entra con esa Junta preseleccionada en el filtro (se puede cambiar a
//     otra desde ahí mismo, no queda atado).
export function MiembrosScreen({ route, navigation }) {
  const juntaIdInicial = route.params?.juntaId ?? null;
  const [juntas, setJuntas] = useState([]);
  const [filtroJuntaId, setFiltroJuntaId] = useState(juntaIdInicial);
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
      const juntasOrdenadas = ordenarPorNombre(listaJuntas);
      setJuntas(juntasOrdenadas);
      // Sin Junta preseleccionada (o si la que había ya no existe), se cae en
      // la primera por orden alfabético -nunca en un "Todos" (ver comentario
      // de arriba).
      const juntaActivaId = juntasOrdenadas.some((j) => j.id === filtroJuntaId)
        ? filtroJuntaId
        : juntasOrdenadas[0]?.id ?? null;
      if (juntaActivaId !== filtroJuntaId) setFiltroJuntaId(juntaActivaId);
      if (!juntaActivaId) {
        setMiembros([]);
        setCargando(false);
        return;
      }
      getMiembrosDeJunta(juntaActivaId).then((lista) => {
        setMiembros(ordenarPorNombre(lista));
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
          {juntaFiltro ? `Junta de Cofradías de ${juntaFiltro.nombre}` : 'Todavía no hay ninguna Junta de Cofradías'}
        </Text>

        <TouchableOpacity
          style={styles.nuevoButton}
          onPress={() => navigation.navigate('FormularioMiembro', { juntaId: filtroJuntaId })}
          activeOpacity={0.85}
          disabled={!filtroJuntaId}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevoButtonTexto}>Añadir miembro</Text>
        </TouchableOpacity>

        {juntas.length > 0 ? (
          <View style={styles.filtroRow}>
            <Text style={styles.filtroEtiqueta}>Junta:</Text>
            <TouchableOpacity style={styles.filtroSelector} onPress={() => setModalFiltroVisible(true)} activeOpacity={0.8}>
              <Text style={styles.filtroTexto} numberOfLines={1}>
                {juntaFiltro?.nombre}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.subtitle} />
            </TouchableOpacity>
          </View>
        ) : null}

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
            {juntaFiltro ? 'Esta Junta todavía no tiene miembros.' : 'Todavía no hay ninguna Junta de Cofradías.'}
          </Text>
        ) : null}
      </ScrollView>

      <Modal transparent visible={modalFiltroVisible} animationType="fade" onRequestClose={() => setModalFiltroVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalFiltroVisible(false)}>
          <View style={styles.modalLista}>
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
