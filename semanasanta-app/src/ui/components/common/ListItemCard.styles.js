import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    padding: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.subtitle,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
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
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    marginTop: 2,
  },
  rightColumn: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
    gap: 4,
  },
  hora: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 19,
    marginBottom: 4,
  },
  favorito: {
    marginLeft: spacing.xs,
  },
});
