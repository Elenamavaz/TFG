import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './ProcesionCardMap.styles';

// Color del punto según EstadoEvento del backend (masculino: Procesion lo
// hereda de Evento, ver StatusBadge).
const COLOR_POR_ESTADO = {
  PROGRAMADO: colors.subtitle,
  EN_CURSO: colors.lightGreenText,
  FINALIZADO: colors.statusFinalizada,
  CANCELADO: colors.redText,
};

// Tarjeta de la lista "En movimiento" bajo el Mapa en Vivo (mockup del
// 2026-10-03, componente de Elena): punto de estado, nombre de la procesión,
// recorrido resumido y botón para centrar el mapa en ella (onPress).
export function ProcesionCardMap({ titulo, ruta, estado, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.85 : 1} disabled={!onPress}>
      {estado ? <View style={[styles.punto, { backgroundColor: COLOR_POR_ESTADO[estado] ?? colors.subtitle }]} /> : null}

      <View style={styles.textos}>
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        {ruta ? (
          <Text style={styles.ruta} numberOfLines={1}>
            {ruta}
          </Text>
        ) : null}
      </View>

      <View style={styles.boton}>
        <Ionicons name="navigate-outline" size={16} color={colors.gold} />
      </View>
    </TouchableOpacity>
  );
}
