import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
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
    marginBottom: spacing.md,
  },
  nuevaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
  },
  nuevaButtonTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
  filtroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filtroEtiqueta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  filtroSelector: {
    flex: 1,
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
  filtroTexto: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitulo: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 16,
    marginRight: spacing.sm,
  },
  cardMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  cardAcciones: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  accionEditar: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
  },
  accionCancelar: {
    color: colors.redText,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
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
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    marginTop: spacing.sm,
  },

  // Modal filtro por Cofradía
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
});
