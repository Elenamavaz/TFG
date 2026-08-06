import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, StatusBadge, PasoListItem } from '../../../components/common';
import { getProcesionPorId, getPasosPorIds, getCofradiaPorId } from '../../../../data/services';
import { formatearDuracion } from '../../../utils/tiempo';
import { colors } from '../../../../theme';
import { styles } from './DetailProcesionScreen.styles';

export function DetalleProcesionScreen({ route, navigation }) {
  const { procesionId } = route.params;
  const [procesion, setProcesion] = useState(null);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);
  const [pasos, setPasos] = useState([]);

  useEffect(() => {
    getProcesionPorId(procesionId).then((data) => {
      setProcesion(data);
      if (!data) return;

      navigation.setOptions({
        title: 'Detalles',
        headerRight: () => <Ionicons name="heart-outline" size={22} color={colors.gold} />,
      });

      getCofradiaPorId(data.cofradiaId).then((cofradia) => setCofradiaNombre(cofradia?.nombre));
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
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Duración</Text>
            <Text style={styles.infoValue}>{formatearDuracion(procesion.duracionMin)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Nazarenos</Text>
            <Text style={styles.infoValue}>{procesion.nazarenos}</Text>
          </View>
        </View>

        {pasos.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Pasos</Text>
            {pasos.map((paso) => (
              <PasoListItem
                key={paso.id}
                label={paso.tipo}
                title={paso.nombre}
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Recorrido</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Mapa del recorrido (Iteración 2)</Text>
        </View>

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
