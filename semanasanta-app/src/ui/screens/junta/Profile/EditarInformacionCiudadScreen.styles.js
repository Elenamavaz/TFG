import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

// Misma base que EditarPerfilJuntaScreen.styles, con título y campos de
// texto largo (historia/patrimonio).
export const styles = StyleSheet.create({
  titulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 26,
  },
  explicacion: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  inputMultilinea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  cargando: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  campo: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },
  // Error de validación de ESTE campo (400 del backend), justo debajo de su
  // TextInput -distinto de "error", que es el aviso genérico para el resto
  // de fallos (red, 404, 409...).
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
});
