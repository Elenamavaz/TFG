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
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
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
  favorito: {
    marginRight: spacing.sm,
  },
  label: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: 2,
  },
});
