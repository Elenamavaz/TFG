import { TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { styles } from './SearchInput.styles';

export function SearchInput({ value, onChangeText, placeholder = 'Buscar...' }) {
  return (
    <View style={styles.wrapper}>
      <Ionicons name="search" size={18} color={colors.goldMuted} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.goldMuted}
        style={styles.input}
      />
    </View>
  );
}
