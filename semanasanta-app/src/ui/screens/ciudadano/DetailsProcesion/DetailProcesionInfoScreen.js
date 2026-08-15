import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, InfoSection } from '../../../components/common';
import { getProcesionPorId, getCofradiaPorId } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './DetailProcesionInfoScreen.styles';

export function DetalleProcesionInfoScreen({ route, navigation }) {
  const { procesionId } = route.params;
  const [procesion, setProcesion] = useState(null);
  const [cofradiaNombre, setCofradiaNombre] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleAlign: 'center',
      headerBackground: () => <View style={styles.headerBackground} />,
      headerTitle: () => (
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Información</Text>
        </View>
      ),
      headerRight: () => <Ionicons name="heart-outline" size={22} color={colors.subtitle} />,
    });
  }, []);

  useEffect(() => {
    getProcesionPorId(procesionId).then((data) => {
      setProcesion(data);
      if (!data) return;
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
    });
  }, [procesionId]);

  if (!procesion) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{procesion.nombre}</Text>
        {cofradiaNombre ? <Text style={styles.subtitle}>{cofradiaNombre}</Text> : null}

        {procesion.historia ? (
          <InfoSection title="Historia">
            <Text style={styles.body}>{procesion.historia}</Text>
          </InfoSection>
        ) : null}

        {procesion.tradicion ? (
          <InfoSection title="Tradición">
            <Text style={styles.body}>{procesion.tradicion}</Text>
          </InfoSection>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
