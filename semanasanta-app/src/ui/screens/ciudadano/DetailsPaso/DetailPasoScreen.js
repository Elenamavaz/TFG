import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ScreenContainer } from '../../../components/common';
import { getPasoPorId } from '../../../../data/services';

import { styles } from './DetailPasoScreen.styles';

export function DetallePasoScreen({ route, navigation }) {
  const { pasoId } = route.params;
  const [paso, setPaso] = useState(null);

  useEffect(() => {
    getPasoPorId(pasoId).then((data) => {
      setPaso(data);
      if (data) navigation.setOptions({ title: data.nombre });
    });
  }, [pasoId]);

  if (!paso) return null;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Imagen</Text>
        </View>

        <Text style={styles.eyebrow}>{paso.tipo}</Text>
        <Text style={styles.title}>{paso.nombre}</Text>

        <Text style={styles.sectionTitle}>Historia y origen</Text>
        <Text style={styles.body}>{paso.descripcion}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
