import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, StatusBadge } from '../../../components/common';
import { getEventoPorId, getCofradiaPorId } from '../../../../data/services';
import { formatearDuracion } from '../../../utils/tiempo';
import { colors } from '../../../../theme';
import { styles } from './DetailEventoScreen.styles';

export function DetalleEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const [evento, setEvento] = useState(null);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleAlign: 'center',
      headerBackground: () => <View style={styles.headerBackground} />,
      headerTitle: () => (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Detalles</Text>
        </View>
      ),
      headerRight: () => <Ionicons name="heart-outline" size={22} color={colors.subtitle} />,
    });
  }, []);

  useEffect(() => {
    getEventoPorId(eventoId).then((data) => {
      setEvento(data);
      if (!data) return;
      getCofradiaPorId(data.cofradiaId).then((cofradia) => setCofradiaNombre(cofradia?.nombre));
    });
  }, [eventoId]);

  if (!evento) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBadge estado={evento.estado} />
        <Text style={styles.title}>{evento.nombre}</Text>
        {cofradiaNombre ? <Text style={styles.subtitle}>{cofradiaNombre}</Text> : null}

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Día</Text>
            <Text style={styles.infoValue}>{evento.dia}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Hora</Text>
            <Text style={styles.infoValue}>{evento.hora}</Text>
          </View>
        </View>
        {evento.duracionMin ? (
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Duración</Text>
              <Text style={styles.infoValue}>{formatearDuracion(evento.duracionMin)}</Text>
            </View>
          </View>
        ) : null}

        {evento.descripcion ? (
          <>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.body}>{evento.descripcion}</Text>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Ubicación</Text>
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapPin}>
            <Ionicons name="location" size={18} color={colors.gold} />
          </View>
          <Text style={styles.mapPlaceholderText}>
            {evento.ubicacion?.direccion ?? 'Ubicación por confirmar'}
          </Text>
        </View>

      </ScrollView>
    </ScreenContainer>
  );
}
