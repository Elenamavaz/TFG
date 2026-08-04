import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 28,
    marginTop: spacing.sm,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  infoLabel: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
  },
  infoValue: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 16,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  mapPlaceholder: {
    height: 160,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  cta: {
    backgroundColor: colors.backgroundRed,
    borderWidth: 0.5,
    borderColor: colors.borderRed,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaText: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
});
