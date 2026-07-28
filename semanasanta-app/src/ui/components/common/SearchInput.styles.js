import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing, radii } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 15,
  },
});
