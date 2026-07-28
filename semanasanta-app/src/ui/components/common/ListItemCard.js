import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './ListItemCard.styles';

export function ListItemCard({ title, subtitle, meta, badge, onPress, rightIcon = 'chevron-forward' }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.textBlock}>
        {badge}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {rightIcon ? <Ionicons name={rightIcon} size={20} color={colors.goldMuted} /> : null}
    </TouchableOpacity>
  );
}
