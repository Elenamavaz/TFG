import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './PasoListItem.styles';

export function PasoListItem({
  label,
  title,
  mostrarFavorito = true,
  mostrarIcono = true,
  esFavorito = false,
  onToggleFavorito,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {mostrarIcono ? (
        <View style={styles.avatar}>
          <MaterialCommunityIcons name="cross" size={20} color={colors.subtitle} />
        </View>
      ) : null}
      <View style={styles.textBlock}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {mostrarFavorito ? (
        <TouchableOpacity
          onPress={onToggleFavorito}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.favorito}
        >
          <Ionicons name={esFavorito ? 'heart' : 'heart-outline'} size={18} color={colors.gold} />
        </TouchableOpacity>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.subtitle} />
    </TouchableOpacity>
  );
}
