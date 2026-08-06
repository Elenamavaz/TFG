import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  title: {
    color: colors.subtitle,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    padding: spacing.md,
  },
});
