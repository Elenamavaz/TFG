import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScreenContainer, StatusBadge, ListItemCard } from '../../../components/common';
import { getProcesionPorId, getPasosPorIds } from '../../../../data/services';
import { formatearDuracion } from '../../../utils/tiempo';
import { styles } from './DetailProcesionScreen.styles';

export function DetalleProcesionScreen({ route, navigation }) {
  const { procesionId } = route.params;
  const [procesion, setProcesion] = useState(null);
  const [pasos, setPasos] = useState([]);

  useEffect(() => {
    getProcesionPorId(procesionId).then((data) => {
      setProcesion(data);
      if (!data) return;
      navigation.setOptions({ title: data.nombre });
      getPasosPorIds(data.pasoIds).then(setPasos);
    });
  }, [procesionId]);

  if (!procesion) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBadge estado={procesion.estado} />
        <Text style={styles.title}>{procesion.nombre}</Text>

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
              <ListItemCard
                key={paso.id}
                title={paso.nombre}
                subtitle={paso.tipo}
                onPress={() => navigation.navigate('DetallePaso', { pasoId: paso.id })}
              />
            ))}
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Recorrido</Text>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>Mapa del recorrido (Iteración 2)</Text>
        </View>

        {procesion.estado === 'EN_CURSO' ? (
          <TouchableOpacity style={styles.cta} onPress={() => navigation.getParent()?.navigate('Mapa')}>
            <Text style={styles.ctaText}>Ir a la procesión</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
