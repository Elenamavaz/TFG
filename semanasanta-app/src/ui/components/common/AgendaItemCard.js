import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './AgendaItemCard.styles';

export function AgendaItemCard({
  titulo,
  subtitulo,
  hora,
  duracion,
  badge,
  mostrarFavorito = true,
  esFavorito = false,
  onToggleFavorito,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={onPress ? 0.8 : 1} disabled={!onPress}>
      <View style={styles.textBlock}>
        <Text style={styles.titulo} numberOfLines={2}>
          {titulo}
        </Text>
        {subtitulo ? (
          <Text style={styles.subtitulo} numberOfLines={1}>
            {subtitulo}
          </Text>
        ) : null}

        <View style={styles.metaRow}>
          {hora ? (
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.subtitle} />
              <Text style={styles.metaTexto}>{hora}</Text>
            </View>
          ) : null}
          {duracion ? (
            <View style={styles.metaItem}>
              <Ionicons name="hourglass-outline" size={14} color={colors.subtitle} />
              <Text style={styles.metaTexto}>{duracion}</Text>
            </View>
          ) : null}
          {badge}
        </View>
      </View>

      {mostrarFavorito ? (
        <TouchableOpacity
          onPress={onToggleFavorito}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.favorito}
        >
          <Ionicons name={esFavorito ? 'heart' : 'heart-outline'} size={20} color={colors.gold} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}
