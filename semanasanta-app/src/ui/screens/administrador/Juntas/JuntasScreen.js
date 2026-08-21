import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getJuntasCofradias, getCiudadesAdmin, actualizarJuntaCofradias } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './JuntasScreen.styles';

const COLOR_POR_ESTADO = {
  Activa: { background: colors.greenBackground, texto: colors.lightGreenText },
  Pendiente: { background: colors.backgroundOrange, texto: colors.orangeText },
  Desactivada: { background: colors.backgroundRed, texto: colors.redText },
};

function EstadoBadge({ estado }) {
  const color = COLOR_POR_ESTADO[estado];
  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <Text style={[styles.badgeTexto, { color: color.texto }]}>{estado}</Text>
    </View>
  );
}

// Una fila por ciudad, igual que Ciudades: si la ciudad tiene Junta, se
// muestran sus datos (Activa/Desactivada); si no, "Pendiente" con "Sin Junta
// asignada" -así el Administrador ve de un vistazo qué ciudades necesitan
// Junta todavía, no solo las que ya la tienen.
export function JuntasScreen({ navigation }) {
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Header con título propio (2026-08-21, ver memoria del TFG): mismo
  // patrón que MiembrosScreen/SolicitudesReactivacionScreen, ver
  // CiudadesScreen para el detalle de por qué hacía falta.
  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Juntas de Cofradías',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getJuntasCofradias(), getCiudadesAdmin()]).then(([juntas, ciudades]) => {
      const filasCalculadas = ciudades.map((ciudad) => {
        const junta = juntas.find((j) => j.ciudadId === ciudad.id) ?? null;
        const estado = !junta ? 'Pendiente' : junta.activa ? 'Activa' : 'Desactivada';
        return { ciudad, junta, estado };
      });
      setFilas(filasCalculadas);
      setCargando(false);
    });
  }, []);

  useFocusEffect(cargar);

  async function alternarActiva(fila) {
    const { junta } = fila;
    await actualizarJuntaCofradias(junta.id, {
      nombre: junta.nombre,
      email: junta.email,
      telefono: junta.telefono,
      ciudadId: junta.ciudadId,
      activa: !junta.activa,
    });
    cargar();
  }

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Juntas de Cofradías</Text>

        <TouchableOpacity
          style={styles.nuevaButton}
          onPress={() => navigation.navigate('FormularioJunta')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevaButtonTexto}>Nueva Junta</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Lista de Juntas actuales</Text>
        {filas.map((fila) => (
          <View key={fila.ciudad.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>{fila.junta ? fila.junta.nombre : fila.ciudad.nombre}</Text>
              <EstadoBadge estado={fila.estado} />
            </View>
            {fila.junta ? <Text style={styles.cardMeta}>{fila.junta.email}</Text> : null}
            <Text style={styles.cardMeta}>
              {fila.junta ? `Ciudad: ${fila.ciudad.nombre}` : 'Sin Junta asignada'}
            </Text>
            <View style={styles.cardAcciones}>
              {fila.junta ? (
                <>
                  <TouchableOpacity onPress={() => navigation.navigate('FormularioJunta', { juntaId: fila.junta.id })}>
                    <Text style={styles.accionEditar}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => alternarActiva(fila)}>
                    <Text style={styles.accionDesactivar}>{fila.junta.activa ? 'Desactivar' : 'Activar'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={() => navigation.navigate('FormularioJunta', { ciudadIdPreseleccionada: fila.ciudad.id })}
                >
                  <Text style={styles.accionEditar}>Crear Junta para esta ciudad</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
        {filas.length === 0 ? <Text style={styles.empty}>No hay ciudades todavía.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
