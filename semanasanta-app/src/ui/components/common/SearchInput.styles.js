import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing, radii } from '../../../theme';

export const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  icon: {
    marginRight: spacing.sm,
    color: colors.subtitle,
  },
  input: {
    flex: 1,
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 15,
  },
});
