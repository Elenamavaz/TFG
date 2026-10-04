import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

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
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
  botonTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 16,
  },
  avisoAutomatico: {
    color: colors.lightGreenText,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  avisoCancelacion: {
    color: colors.redText,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
  // "Crear Notificación" (mockup del 2026-09-30): fondo oscuro dorado con
  // borde, secundario respecto a "Ok" pero más visible que un enlace.
  notificarButton: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
  notificarTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 16,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  ayuda: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
  },
});
