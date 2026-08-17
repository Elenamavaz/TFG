import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../../theme';

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

  // Modo de acceso
  modoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    backgroundColor: colors.backgroundAlt,
  },
  modoButtonActivoCiudadano: {
    backgroundColor: colors.backgroundRed,
    borderColor: colors.borderRed,
  },
  modoButtonActivoCofrade: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  modoButtonTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  modoButtonTextoActivoCiudadano: {
    color: colors.cream,
  },
  modoButtonTextoActivoCofrade: {
    color: colors.background,
  },

  // Banner modo cofrade
  cofradeBanner: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: colors.gold,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  cofradeTitulo: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 16,
  },
  cofradeTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  ubicacionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gold,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  ubicacionButtonActivo: {
    backgroundColor: colors.greenBackground,
    borderWidth: 0.5,
    borderColor: colors.greenBorder,
  },
  ubicacionButtonTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  ubicacionButtonTextoActivo: {
    color: colors.lightGreenText,
  },

  // Ciudad seleccionada
  ciudadCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  ciudadCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  cambiarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cambiar: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 13,
  },

  // Favoritos
  favoritoCard: {
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
  favoritoTextBlock: {
    flex: 1,
  },
  favoritoTitulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 16,
  },
  favoritoMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },

  // Notificaciones
  notificacionesCard: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  notificacionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  notificacionRowConBorde: {
    borderTopWidth: 0.5,
    borderTopColor: colors.surfaceAlt,
  },
  notificacionTextBlock: {
    flex: 1,
    marginRight: spacing.sm,
  },
  notificacionTitulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  notificacionDescripcion: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },

  // Cerrar sesión -- mismo granate que modoButtonActivoCiudadano, para que
  // se lea como "acción de cuenta" en toda la pantalla.
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
