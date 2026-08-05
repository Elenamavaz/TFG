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
    fontSize: 32,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
  },
  filtroButton: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    backgroundColor: colors.backgroundAlt,
  },
  chipActivo: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  chipTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 12,
  },
  chipTextoActivo: {
    color: colors.background,
  },
  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 19,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.lg,
  },
});
