import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  check: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 28,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  boton: {
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    alignSelf: 'stretch',
  },
  botonTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 16,
  },
  botonDeshabilitado: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    alignSelf: 'stretch',
    opacity: 0.5,
  },
  botonDeshabilitadoTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
});
