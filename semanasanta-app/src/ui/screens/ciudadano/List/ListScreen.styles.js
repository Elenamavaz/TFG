import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  list: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.lg,
  },
});
