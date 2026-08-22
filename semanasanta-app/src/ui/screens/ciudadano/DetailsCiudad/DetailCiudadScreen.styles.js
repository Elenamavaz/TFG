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
    fontSize: 28,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.subtitle,
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
});
