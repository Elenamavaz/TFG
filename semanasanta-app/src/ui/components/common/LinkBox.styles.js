import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { fontFamilies } from '../../../theme';
import { spacing } from '../../../theme';

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
