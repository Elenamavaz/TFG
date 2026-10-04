import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.subtitle,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  headerBadgeText: {
    color: colors.cream,
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 14,
    letterSpacing: 0.5,
  },
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
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
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
    fontSize: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  direccionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    padding: spacing.md,
  },
  direccionTexto: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 13,
  },
  mapaUbicacion: {
    marginTop: spacing.sm,
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
