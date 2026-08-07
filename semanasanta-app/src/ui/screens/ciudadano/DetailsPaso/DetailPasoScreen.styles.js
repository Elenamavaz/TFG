import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 24,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    marginTop: 2,
  },
  imagen: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.subtitle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});
