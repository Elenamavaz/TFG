import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eyebrow: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 40,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 22,
  },
  cardMeta: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
});
