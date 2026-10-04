import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

// Misma base que las listas del panel de Junta (ProcesionesScreen/
// PasosScreen): título grande, botón dorado de alta, tarjetas oscuras.
export const styles = StyleSheet.create({
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 28,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 2,
  },
  explicacion: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  generarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
  },
  generarTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
  error: {
    color: colors.redText,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitleSinMargen: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  revocadosToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardRevocada: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // El código es lo que se lee en voz alta o se teclea: grande y espaciado.
  codigo: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 20,
    letterSpacing: 3,
  },
  codigoRevocado: {
    color: colors.subtitle,
    textDecorationLine: 'line-through',
  },
  badge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  badgeTexto: {
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 11,
  },
  cardAcciones: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  accion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  accionCompartir: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
  },
  accionRevocar: {
    color: colors.redText,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
  },
});
