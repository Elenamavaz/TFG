import { StyleSheet } from 'react-native';
import { fontFamilies, radii, spacing } from '../../../theme';

export const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  label: {
    fontFamily: fontFamilies.uiMedium,
    fontSize: 12,
  },
});
