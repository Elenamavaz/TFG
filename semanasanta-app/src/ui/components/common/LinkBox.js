import { Linking, Text, TouchableOpacity } from 'react-native';
import { styles } from './LinkBox.styles';

export function LinkBox({ url }) {
  return (
    <TouchableOpacity onPress={() => Linking.openURL(url)}>
      <Text style={styles.link} numberOfLines={2}>
        {url}
      </Text>
    </TouchableOpacity>
  );
}
