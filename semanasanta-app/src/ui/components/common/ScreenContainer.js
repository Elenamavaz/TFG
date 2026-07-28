import { SafeAreaView } from 'react-native';
import { styles } from './ScreenContainer.styles';

export function ScreenContainer({ children, style }) {
  return <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>;
}
