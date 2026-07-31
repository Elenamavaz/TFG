import { Text, View } from 'react-native';
import { styles } from './InfoSection.styles';

export function InfoSection({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.box}>{children}</View>
    </View>
  );
}
