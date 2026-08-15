import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, InfoSection, LinkBox } from '../../../components/common';
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
      // .catch: Procesion sigue en mock (pendiente de conectar) y su
      // cofradiaId no es un id real -getCofradiaPorId sí lo es desde el
      // 2026-08-15-, así que fallará hasta que también se conecte; mejor no
      // mostrar nombre de cofradía que dejar una promesa rechazada sin capturar.
      getCofradiaPorId(data.cofradiaId)
        .then((cofradia) => setCofradiaNombre(cofradia?.nombre))
        .catch(() => setCofradiaNombre(null));
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

        {procesion.origen ? (
          <InfoSection title="Origen">
            <Text style={styles.body}>{procesion.origen}</Text>
          </InfoSection>
        ) : null}

        {procesion.webOficial ? (
          <InfoSection title="Web oficial">
            <LinkBox url={procesion.webOficial} />
          </InfoSection>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}
