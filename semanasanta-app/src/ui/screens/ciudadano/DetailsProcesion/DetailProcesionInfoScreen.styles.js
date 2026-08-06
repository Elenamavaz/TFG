import { StyleSheet } from 'react-native';
import { colors, fontFamilies, spacing } from '../../../../theme';

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
    fontSize: 26,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: 2,
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});
