import { Text, View } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './StatusBadge.styles';

// Claves = EstadoEvento del backend, el único enum de estado (Procesion
// hereda "estado" de Evento). Una sola etiqueta por estado, en masculino,
// igual para procesiones y eventos (2026-10-04, decisión de Elena).
const ESTADOS = {
  PROGRAMADO: { label: 'Programado', color: colors.subtitle, background: colors.surfaceAlt },
  EN_CURSO: { label: 'En curso', color: colors.lightGreenText, background: colors.lightGreenBackground, punto: true },
  FINALIZADO: { label: 'Finalizado', color: colors.statusFinalizado },
  CANCELADO: { label: 'Cancelado', color: colors.redText, background: colors.backgroundRed },
  // No es un estado real: distingue un evento entre resultados de búsqueda mezclados con procesiones.
  EVENTO: { label: 'Evento', color: colors.gold, background: colors.surfaceAlt },
};

export function StatusBadge({ estado }) {
  const info = ESTADOS[estado] ?? { label: estado, color: colors.subtitle };

  return (
    <View style={[styles.badge, { backgroundColor: info.background }]}>
      {info.punto ? <View style={[styles.dot, { backgroundColor: info.color }]} /> : null}
      <Text style={[styles.label, { color: info.color }]}>{info.label}</Text>
    </View>
  );
}
