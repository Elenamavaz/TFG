import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  textBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 4,
  },
});
