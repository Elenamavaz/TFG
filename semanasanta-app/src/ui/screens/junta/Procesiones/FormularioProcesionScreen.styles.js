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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectorTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },
  selectorPlaceholder: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },

  // Día / Salida / Duración: tres campos compactos en una fila, ver mockup.
  filaCompacta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  campoCompacto: {
    flex: 1,
  },
  etiquetaCompacta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  etiquetaCompactaTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 11,
  },
  selectorCompacto: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  selectorTextoCompacto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  selectorPlaceholderCompacto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  inputCompacto: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },

  // Recorrido / importar GPX
  importarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.gold,
    paddingVertical: spacing.sm,
  },
  importarTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  ayuda: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  recorridoInfo: {
    color: colors.lightGreenText,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // "Lista de pasos" (informativo, 2026-08-23, mismo patrón que
  // FormularioEventoScreen -no es un campo del formulario, enlaza a
  // PasosScreen filtrado por la cofradía elegida).
  pasosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  pasosTitulo: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  pasosMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  pasosVerLista: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  pasosVerListaTexto: {
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
  cancelarButton: {
    backgroundColor: colors.backgroundRed,
    borderWidth: 0.5,
    borderColor: colors.borderRed,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  cancelarTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
  // Solo visible editando (2026-08-20, ver confirmarEliminar): mismo aspecto
  // que cancelarButton -misma gravedad visual-, nombre propio porque es una
  // acción distinta (borra de verdad, no descarta el formulario).
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

  // Modal selector (Cofradía / Día)
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalLista: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: 320,
    maxHeight: 360,
  },
  modalItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  modalItemTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
  modalVacio: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    padding: spacing.md,
    textAlign: 'center',
  },
});
