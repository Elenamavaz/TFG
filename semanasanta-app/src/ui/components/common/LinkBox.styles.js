import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  link: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
});
