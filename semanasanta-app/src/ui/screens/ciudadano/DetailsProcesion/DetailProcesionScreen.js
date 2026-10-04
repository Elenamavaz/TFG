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
import { styles } from './DetailProcesionScreen.styles';

export function DetalleProcesionScreen({ route, navigation }) {
  const { procesionId } = route.params;
  const { esFavorito, alternarFavorito } = context.useFavoritos();
  const [procesion, setProcesion] = useState(null);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);
  const [pasos, setPasos] = useState([]);
  // Recorrido con sus puntos (y coordenadas) para el mapa de la sección
  // "Recorrido" (2026-10-04: mapa en vez de la lista de puntos).
  const { data: recorrido } = useQuery({
    queryKey: ['recorrido', procesion?.recorridoId],
    queryFn: () => services.getRecorridoCompleto(procesion.recorridoId),
    enabled: !!procesion?.recorridoId,
  });

  useEffect(() => {
    services.getProcesionPorId(procesionId).then((data) => {
      setProcesion(data);
      if (!data) return;

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

      // Una procesión puede tener varias cofradías participantes (N:M real
      // en el backend): se muestran todas, separadas por coma (decisión del
      // 2026-08-15).
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
  }, [procesionId]);

  if (!procesion) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <common.StatusBadge estado={procesion.estado} />
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => navigation.navigate('DetalleProcesionInfo', { procesionId })}
          >
            <Ionicons name="reader-outline" size={18} color={colors.subtitle} />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{procesion.nombre}</Text>
        {cofradiaNombre ? <Text style={styles.subtitle}>{cofradiaNombre}</Text> : null}

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Día</Text>
            <Text style={styles.infoValue}>{procesion.dia}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Salida</Text>
            <Text style={styles.infoValue}>{procesion.horaSalida}</Text>
          </View>
        </View>
        {procesion.duracionMin ? (
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Duración</Text>
              <Text style={styles.infoValue}>{tiempo.formatearDuracion(procesion.duracionMin)}</Text>
            </View>
          </View>
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

        <Text style={styles.sectionTitle}>Recorrido</Text>
        {recorrido?.puntos.length > 1 ? (
          <maps.MapaRecorrido
            puntos={recorrido.puntos}
            procesionId={procesion.id}
            enCurso={procesion.estado === 'EN_CURSO'}
          />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Recorrido por confirmar</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.cta, procesion.estado !== 'EN_CURSO' && styles.ctaDisabled]}
          disabled={procesion.estado !== 'EN_CURSO'}
          onPress={() => navigation.getParent()?.navigate('Mapa', { procesionId: procesion.id })} // el mapa se centra en ella
        >
          <Text style={styles.ctaText}>Ir a la procesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </common.ScreenContainer>
  );
}
