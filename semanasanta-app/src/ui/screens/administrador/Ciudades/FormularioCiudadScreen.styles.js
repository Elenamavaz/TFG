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
  campo: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  // Error de validación de ESTE campo (400 del backend), justo debajo de su
  // TextInput -distinto de "error", que es el aviso genérico para el resto
  // de fallos (red, 404, 409...).
  errorCampo: {
    color: colors.redText,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 11,
    marginTop: spacing.xs,
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
  inputMultilinea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  // Latitud / Longitud (2026-08-23): dos campos cortos en una fila, mismo
  // patrón compacto que otros formularios del panel.
  filaCompacta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputCompacto: {
    flex: 1,
  },
  activaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  juntaBox: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    padding: spacing.md,
  },
  juntaTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },
  juntaCrearButton: {
    borderWidth: 0.5,
    borderColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  juntaCrearTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
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
    marginTop: spacing.sm,
  },
  botonDeshabilitado: {
    opacity: 0.7,
  },
  botonTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 16,
  },
  eliminarButton: {
    backgroundColor: colors.backgroundRed,
    borderWidth: 0.5,
    borderColor: colors.borderRed,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  eliminarTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
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
