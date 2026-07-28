import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

const ESTADOS = {
  PROGRAMADA: { label: 'Programada', color: colors.statusProgramada },
  PROGRAMADO: { label: 'Programado', color: colors.statusProgramada },
  EN_CURSO: { label: 'En curso', color: colors.statusEnCursoText, background: colors.statusEnCurso },
  FINALIZADA: { label: 'Finalizada', color: colors.statusFinalizada },
  FINALIZADO: { label: 'Finalizado', color: colors.statusFinalizada },
  CANCELADA: { label: 'Cancelada', color: colors.statusCancelada },
  CANCELADO: { label: 'Cancelado', color: colors.statusCancelada },
};

export function StatusBadge({ estado }) {
  const info = ESTADOS[estado] ?? { label: estado, color: colors.goldMuted };

  return (
    <View style={[styles.badge, { borderColor: info.color, backgroundColor: info.background }]}>
      {info.label === 'En curso' && <View style={[styles.dot, { backgroundColor: info.color }]} />}
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 12,
  },
});
