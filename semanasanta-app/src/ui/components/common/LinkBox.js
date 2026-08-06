import { Linking, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './LinkBox.styles';

export function LinkBox({ url }) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => Linking.openURL(url)} activeOpacity={0.8}>
      <Text style={styles.link} numberOfLines={2}>
        {url}
      </Text>
      <Ionicons name="open-outline" size={16} color={colors.cream} />
    </TouchableOpacity>
  );
}
