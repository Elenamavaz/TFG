import { Text, View } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './StatusBadge.styles';

const ESTADOS = {
  PROGRAMADA: { label: 'Programada', color: colors.subtitle, background: colors.surfaceAlt },
  PROGRAMADO: { label: 'Programado', color: colors.subtitle, background: colors.surfaceAlt },
  EN_CURSO: { label: 'En curso', color: colors.lightGreenText, background: colors.lightGreenBackground },
  FINALIZADA: { label: 'Finalizada', color: colors.statusFinalizada },
  FINALIZADO: { label: 'Finalizado', color: colors.statusFinalizada },
  CANCELADA: { label: 'Cancelada', color: colors.redText, background: colors.backgroundRed },
  CANCELADO: { label: 'Cancelado', color: colors.redText, background: colors.backgroundRed },
};

export function StatusBadge({ estado }) {
  const info = ESTADOS[estado] ?? { label: estado, color: colors.subtitle };

  return (
    <View style={[styles.badge, { backgroundColor: info.background }]}>
      {info.label === 'En curso' && <View style={[styles.dot, { backgroundColor: info.color }]} />}
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}
