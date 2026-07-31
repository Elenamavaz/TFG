import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './ProcesionCard.styles';

export function ProcesionCard({
  titulo,
  subtitulo,
  dia,
  hora,
  ruta,
  badge,
  mostrarFavorito = true,
  mostrarChevron = true,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1} disabled={!onPress}>
      {mostrarFavorito ? (
        <Ionicons name="heart-outline" size={18} color={colors.gold} style={styles.favorito} />
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {badge}
          {dia ? <Text style={styles.dia}>{dia}</Text> : null}
        </View>
        {hora ? <Text style={styles.hora}>{hora}</Text> : null}
      </View>

      <Text style={styles.titulo} numberOfLines={2}>
        {titulo}
      </Text>
      {subtitulo ? (
        <Text style={styles.subtitulo} numberOfLines={1}>
          {subtitulo}
        </Text>
      ) : null}
      {ruta ? (
        <Text style={styles.ruta} numberOfLines={1}>
          {ruta}
        </Text>
      ) : null}

      {mostrarChevron ? (
        <View style={styles.chevronRow}>
          <Ionicons name="chevron-forward" size={16} color={colors.subtitle} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
