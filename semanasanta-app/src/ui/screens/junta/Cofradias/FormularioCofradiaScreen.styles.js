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
  activaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  // "Elementos de la cofradia" (2026-08-23): tres enlaces informativos a
  // Procesiones/Eventos/Pasos filtrados por esta cofradía -mismo patrón que
  // "Lista de pasos" en FormularioProcesionScreen/FormularioEventoScreen,
  // repetido tres veces.
  elementoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  elementoTitulo: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  elementoMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  elementoVerLista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  elementoVerListaTexto: {
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
