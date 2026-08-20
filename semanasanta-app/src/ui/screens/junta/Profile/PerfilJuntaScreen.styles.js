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
    fontSize: 32,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  // Rol
  rolCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: colors.gold,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  rolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  rolBadgeTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
  },
  rolDescripcion: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.sm,
  },

  // Ciudad gestionada
  ciudadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  ciudadNombre: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
  },
  ciudadMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },

  // Gestión
  opcionRow: {
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
  opcionRowDeshabilitada: {
    opacity: 0.55,
  },
  opcionIcono: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcionTextBlock: {
    flex: 1,
  },
  opcionTitulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 16,
  },
  opcionSubtitulo: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },

  // Cerrar sesión
  cerrarSesionButton: {
    backgroundColor: colors.backgroundRed,
    borderWidth: 0.5,
    borderColor: colors.borderRed,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  cerrarSesionTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
});
