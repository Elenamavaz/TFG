import { Text, View } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './StatusBadge.styles';

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
