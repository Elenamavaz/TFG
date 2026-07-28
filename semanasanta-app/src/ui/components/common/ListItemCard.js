import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './ListItemCard.styles';

export function ListItemCard({
  icon,
  title,
  subtitle,
  hora,
  badge,
  mostrarFavorito = false,
  onPress,
  rightIcon = 'chevron-forward',
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {icon ? (
        <View style={styles.avatar}>
          <MaterialCommunityIcons name={icon} size={20} color={colors.subtitle} />
        </View>
      ) : null}

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {hora || badge ? (
        <View style={styles.rightColumn}>
          {hora ? <Text style={styles.hora}>{hora}</Text> : null}
          {badge}
        </View>
      ) : null}

      {mostrarFavorito ? (
        <Ionicons name="heart-outline" size={20} color={colors.gold} style={styles.favorito} />
      ) : rightIcon ? (
        <Ionicons name={rightIcon} size={20} color={colors.subtitle} />
      ) : null}
    </TouchableOpacity>
  );
}
