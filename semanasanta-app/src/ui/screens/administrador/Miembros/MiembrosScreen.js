import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getJuntaCofradiasPorId,
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

// Punto de entrada de "Miembros" (mockup del 2026-08-17, última pieza del
// panel Admin junto a Ciudades/Juntas): se llega aquí desde el "Equipo" de
// Editar Junta, con juntaId por params -no tiene sentido una lista de
// miembros sin decir de qué Junta.
export function MiembrosScreen({ route, navigation }) {
  const { juntaId } = route.params;
  const [junta, setJunta] = useState(null);
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
    Promise.all([getJuntaCofradiasPorId(juntaId), getMiembrosDeJunta(juntaId)]).then(([juntaCargada, lista]) => {
      setJunta(juntaCargada);
      setMiembros(lista);
      setCargando(false);
    });
  }, [juntaId]);

  useFocusEffect(cargar);

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
        <Text style={styles.subtitle}>{junta ? `Junta de Cofradías de ${junta.nombre}` : ''}</Text>

        <TouchableOpacity
          style={styles.nuevoButton}
          onPress={() => navigation.navigate('FormularioMiembro', { juntaId })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevoButtonTexto}>Añadir miembro</Text>
        </TouchableOpacity>

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
                  <TouchableOpacity onPress={() => navigation.navigate('FormularioMiembro', { juntaId, miembroId: miembro.id })}>
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
        {miembros.length === 0 ? <Text style={styles.empty}>Esta Junta todavía no tiene miembros.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
