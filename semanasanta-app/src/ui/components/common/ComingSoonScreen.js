import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from './ScreenContainer';
import { colors } from '../../../theme';
import { styles } from './ComingSoonScreen.styles';

export function ComingSoonScreen({ icon, title, description }) {
  return (
    <ScreenContainer style={styles.container}>
      <Ionicons name={icon} size={40} color={colors.goldMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </ScreenContainer>
  );
}
