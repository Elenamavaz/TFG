import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { getPasoPorId } from '../../../../data/services/pasoService';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

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

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  imagePlaceholder: {
    height: 180,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  imagePlaceholderText: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
  },
  eyebrow: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 28,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});
