import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 28,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.gold,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
