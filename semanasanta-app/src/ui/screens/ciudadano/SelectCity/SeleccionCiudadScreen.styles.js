import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  title: {
    color: colors.cream,
    fontFamily: fontFamilies.titleBold,
    fontSize: 40,
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.subtitle,
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
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.cream,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 22,
  },
  cardMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
});
