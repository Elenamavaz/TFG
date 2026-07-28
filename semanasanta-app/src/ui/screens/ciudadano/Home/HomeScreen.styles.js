import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  ciudadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ciudad: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  diaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 32,
  },
  subtitle: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
  menuButton: {
    padding: spacing.xs,
  },
  enCursoCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  enCursoTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 22,
    marginTop: spacing.xs,
  },
  enCursoMeta: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: colors.gold,
    fontFamily: fontFamilies.titleBold,
    fontSize: 24,
  },
  statLabel: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 20,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: spacing.lg,
  },
  menu: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    minWidth: 180,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  diaMenu: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: 320,
  },
  diaMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  diaMenuItemActivo: {
    backgroundColor: colors.surface,
  },
  diaMenuItemText: {
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
  diaMenuItemTextActivo: {
    color: colors.gold,
  },
  diaMenuItemFecha: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
  },
});
