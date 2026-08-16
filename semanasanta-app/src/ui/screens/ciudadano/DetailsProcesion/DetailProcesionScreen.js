import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ScreenContainer, StatusBadge, PasoListItem } from '../../../components/common';
import { getProcesionPorId, getPasosPorIds, getCofradiaPorId, getRecorridoCompleto } from '../../../../data/services';
import { formatearDuracion } from '../../../utils/tiempo';
import { useFavoritos } from '../../../../application/context';
import { colors } from '../../../../theme';
import { styles } from './DetailProcesionScreen.styles';

export function DetalleProcesionScreen({ route, navigation }) {
  const { procesionId } = route.params;
  const { esFavorito, alternarFavorito } = useFavoritos();
  const [procesion, setProcesion] = useState(null);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);
  const [pasos, setPasos] = useState([]);
  // Sin mapa real todavía (pendiente de development build + API key, ver
  // memoria del TFG): de momento se muestra la lista ordenada de puntos en
  // vez del mapa en sí.
  const { data: recorrido } = useQuery({
    queryKey: ['recorrido', procesion?.recorridoId],
    queryFn: () => getRecorridoCompleto(procesion.recorridoId),
    enabled: !!procesion?.recorridoId,
  });

  useEffect(() => {
    getProcesionPorId(procesionId).then((data) => {
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
      Promise.all(data.cofradiaIds.map((id) => getCofradiaPorId(id).catch(() => null))).then((cofradias) =>
        setCofradiaNombre(
          cofradias
            .map((c) => c?.nombre)
            .filter(Boolean)
            .join(', ')
        )
      );
      getPasosPorIds(data.pasoIds).then(setPasos);
    });
  }, [procesionId]);

  if (!procesion) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <StatusBadge estado={procesion.estado} />
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
              <Text style={styles.infoValue}>{formatearDuracion(procesion.duracionMin)}</Text>
            </View>
          </View>
        ) : null}

        {pasos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {pasos.map((paso) => (
              <PasoListItem
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
        {recorrido?.puntos.length > 0 ? (
          <View style={styles.recorridoLista}>
            {recorrido.puntos.map((punto, indice) => (
              <View key={punto.id} style={styles.recorridoPunto}>
                <View style={styles.recorridoNumero}>
                  <Text style={styles.recorridoNumeroTexto}>{indice + 1}</Text>
                </View>
                <Text style={styles.recorridoPuntoTexto}>{punto.nombre ?? 'Punto de paso'}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Recorrido por confirmar</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.cta, procesion.estado !== 'EN_CURSO' && styles.ctaDisabled]}
          disabled={procesion.estado !== 'EN_CURSO'}
          onPress={() => navigation.getParent()?.navigate('Mapa')}
        >
          <Text style={styles.ctaText}>Ir a la procesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
