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
    color: colors.goldMuted,
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
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  cta: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaText: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
});
