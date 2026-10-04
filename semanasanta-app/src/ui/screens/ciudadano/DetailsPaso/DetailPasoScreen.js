import { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { common } from '../../../components';
import { services } from '../../../../data';
import { colors } from '../../../../theme';
import { styles } from './DetailPasoScreen.styles';

export function DetallePasoScreen({ route, navigation }) {
  const { pasoId } = route.params;
  const [paso, setPaso] = useState(null);
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
    services.getPasoPorId(pasoId).then((data) => {
      setPaso(data);
      if (!data) return;
      // .catch: Paso sigue en mock (pendiente de conectar, ver memoria del
      // TFG) y su cofradiaId no es un id real -getCofradiaPorId sí lo es
      // desde el 2026-08-15, así que fallará hasta que también se conecte;
      // que no muestre nombre de cofradía es mejor que una promesa rechazada
      // sin capturar.
      services.getCofradiaPorId(data.cofradiaId)
        .then((cofradia) => setCofradiaNombre(cofradia?.nombre))
        .catch(() => setCofradiaNombre(null));
    });
  }, [pasoId]);

  if (!paso) return null;

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>{paso.nombre}</Text>
            {cofradiaNombre ? <Text style={styles.subtitle}>{cofradiaNombre}</Text> : null}
          </View>
          {paso.imagen ? (
            <Image source={{ uri: paso.imagen }} style={styles.imagen} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={22} color={colors.subtitle} />
            </View>
          )}
        </View>

        {paso.historia ? (
          <common.InfoSection title="Historia y Origen">
            <Text style={styles.body}>{paso.historia}</Text>
          </common.InfoSection>
        ) : null}

        {paso.analisisArtistico ? (
          <common.InfoSection title="Análisis Artístico y Detalles">
            <Text style={styles.body}>{paso.analisisArtistico}</Text>
          </common.InfoSection>
        ) : null}
      </ScrollView>
    </common.ScreenContainer>
  );
}
