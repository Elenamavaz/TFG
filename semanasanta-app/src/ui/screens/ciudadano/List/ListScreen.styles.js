import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 32,
    marginBottom: spacing.md,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.lg,
  },
});
