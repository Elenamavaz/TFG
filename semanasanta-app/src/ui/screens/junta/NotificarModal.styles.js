import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { fontFamilies } from '../../../theme';
import { radii } from '../../../theme';
import { spacing } from '../../../theme';

// Ver NotificarModal (compartido por procesiones y eventos). Botones según
// el mockup "Procesión Actualizada": Cancelar en rojo, Enviar con borde dorado.
export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  titulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
  },
  subtitulo: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  etiqueta: {
    color: colors.cream,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  selectorTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  selectorPlaceholder: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  desplegable: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  desplegableItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  desplegableTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  inputMultilinea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  prioridadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  prioridadChip: {
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  prioridadChipTexto: {
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 12,
  },
  error: {
    color: colors.redText,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  acciones: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  // justifyContent + textAlign (2026-10-03): "Enviar notificaciones" ocupa
  // dos líneas en pantallas estrechas y quedaba descentrado; con esto los
  // dos textos quedan centrados en vertical y horizontal aunque partan.
  cancelarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: colors.backgroundRed,
  },
  cancelarTexto: {
    color: colors.redText,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  enviarButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  enviarTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
});
