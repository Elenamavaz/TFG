import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { common } from '../../../components';
import { maps } from '../../../components';
import { services } from '../../../../data';
import { tiempo } from '../../../utils';
import { context } from '../../../../application';
import { colors } from '../../../../theme';
import { styles } from './DetailEventoScreen.styles';

// Pasos añadidos el 2026-08-23 (mismo patrón que DetailProcesionScreen,
// getPasosPorIds + PasoListItem): Evento ganó su propia relación con Paso
// ese mismo día (ver Evento.java), esta pantalla se había quedado sin
// mostrarlos -Evento no los tenía cuando se escribió originalmente.
export function DetalleEventoScreen({ route, navigation }) {
  const { eventoId } = route.params;
  const { esFavorito, alternarFavorito } = context.useFavoritos();
  const [evento, setEvento] = useState(null);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);
  const [pasos, setPasos] = useState([]);
  const { data: ubicacion } = useQuery({
    queryKey: ['ubicacion', evento?.ubicacionId],
    queryFn: () => services.getUbicacionPorId(evento.ubicacionId),
    enabled: !!evento?.ubicacionId,
  });

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
    services.getEventoPorId(eventoId).then((data) => {
      setEvento(data);
      if (!data) return;
      // Un evento puede tener varias cofradías participantes (N:M real en el
      // backend, no una sola organizadora): se muestran todas, separadas por
      // coma (decisión del 2026-08-15).
      Promise.all(data.cofradiaIds.map((id) => services.getCofradiaPorId(id).catch(() => null))).then((cofradias) =>
        setCofradiaNombre(
          cofradias
            .map((c) => c?.nombre)
            .filter(Boolean)
            .join(', ')
        )
      );
      services.getPasosPorIds(data.pasoIds).then(setPasos);
    });
  }, [eventoId]);

  if (!evento) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <common.StatusBadge estado={evento.estado} />
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
          {evento.duracionMin ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Duración</Text>
              <Text style={styles.infoValue}>{tiempo.formatearDuracion(evento.duracionMin)}</Text>
            </View>
          ) : null}
        </View>

        {evento.historia ? (
          <common.InfoSection title="Historia">
            <Text style={styles.body}>{evento.historia}</Text>
          </common.InfoSection>
        ) : null}

        {evento.tradicion ? (
          <common.InfoSection title="Tradición">
            <Text style={styles.body}>{evento.tradicion}</Text>
          </common.InfoSection>
        ) : null}

        {pasos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {pasos.map((paso) => (
              <common.PasoListItem
                key={paso.id}
                label={paso.tipo}
                title={paso.nombre}
                esFavorito={esFavorito(paso.id, 'paso')}
                onToggleFavorito={() => alternarFavorito(paso.id, 'paso')}
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}

        {/* Dirección + mapa con el sitio (2026-10-04, mockup de Elena). */}
        <Text style={styles.sectionTitle}>Ubicación</Text>
        <View style={styles.direccionCard}>
          <Ionicons name="location-outline" size={18} color={colors.gold} />
          <Text style={styles.direccionTexto}>{ubicacion?.direccion ?? 'Ubicación por confirmar'}</Text>
        </View>
        {ubicacion ? (
          <View style={styles.mapaUbicacion}>
            <maps.MapaUbicacion latitud={ubicacion.latitud} longitud={ubicacion.longitud} titulo={evento.nombre} />
          </View>
        ) : null}

      </ScrollView>
    </common.ScreenContainer>
  );
}
