import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  cargando: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  subtitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 20,
  },
  ayuda: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  filaTexto: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.redText,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  boton: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 16,
  },
  cancelarButton: {
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelarTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
});
