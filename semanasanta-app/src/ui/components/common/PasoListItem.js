import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './PasoListItem.styles';

export function PasoListItem({ label, title, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.avatar}>
        <MaterialCommunityIcons name="cross" size={20} color={colors.subtitle} />
      </View>
      <View style={styles.textBlock}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
