import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCiudadPorId, getCofradiasGestion, actualizarCofradia } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './CofradiasScreen.styles';

// Mismo criterio que CiudadesScreen (panel de Administrador): "Activa"/
// "Desactivada" sí es un campo real aquí (Cofradia.activa, 2026-08-22),
// a diferencia del "Activa" que salía también en el mockup de Pasos -ese
// no tiene campo detrás en el backend, se ha quitado de PasosScreen.
const COLOR_POR_ESTADO = {
  Activa: { background: colors.greenBackground, texto: colors.lightGreenText },
  Desactivada: { background: colors.backgroundRed, texto: colors.redText },
};

function EstadoBadge({ activa }) {
  const color = COLOR_POR_ESTADO[activa ? 'Activa' : 'Desactivada'];
  return (
    <View style={[styles.badge, { backgroundColor: color.background }]}>
      <Text style={[styles.badgeTexto, { color: color.texto }]}>{activa ? 'Activa' : 'Desactivada'}</Text>
    </View>
  );
}

// Mockup del 2026-08-22: se llega desde "Cofradias" del menú de Gestión en
// PerfilJuntaScreen, con ciudadId por params -misma ciudad de la Junta que
// ha iniciado sesión, no hace falta elegirla (mismo patrón que Procesiones).
export function CofradiasScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [ciudad, setCiudad] = useState(null);
  const [cofradias, setCofradias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Cofradias',
    });
  }, [navigation]);

  const cargar = useCallback(() => {
    Promise.all([getCiudadPorId(ciudadId), getCofradiasGestion(ciudadId)]).then(([ciudadCargada, listaCofradias]) => {
      setCiudad(ciudadCargada);
      setCofradias(listaCofradias);
      setCargando(false);
    });
  }, [ciudadId]);

  useFocusEffect(cargar);

  async function alternarActiva(cofradia) {
    await actualizarCofradia(cofradia.id, {
      nombre: cofradia.nombre,
      historia: cofradia.historia,
      web: cofradia.web,
      ciudadId: cofradia.ciudadId,
      activa: !cofradia.activa,
    });
    cargar();
  }

  if (cargando) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Cofradias</Text>
        <Text style={styles.subtitle}>{ciudad ? `Cofradias de ${ciudad.nombre}` : ''}</Text>

        <TouchableOpacity
          style={styles.nuevaButton}
          onPress={() => navigation.navigate('FormularioCofradia', { ciudadId })}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color={colors.background} />
          <Text style={styles.nuevaButtonTexto}>Nueva Cofradia</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Lista de cofradías actuales</Text>
        {cofradias.map((cofradia) => (
          <View key={cofradia.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitulo}>{cofradia.nombre}</Text>
              <EstadoBadge activa={cofradia.activa} />
            </View>
            <View style={styles.cardAcciones}>
              <TouchableOpacity onPress={() => navigation.navigate('FormularioCofradia', { ciudadId, cofradiaId: cofradia.id })}>
                <Text style={styles.accionEditar}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => alternarActiva(cofradia)}>
                <Text style={styles.accionDesactivar}>{cofradia.activa ? 'Desactivar' : 'Activar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {cofradias.length === 0 ? <Text style={styles.empty}>No hay cofradías todavía.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
