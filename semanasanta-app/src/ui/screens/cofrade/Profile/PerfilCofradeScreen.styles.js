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
  },
  subtitulo: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    marginTop: 2,
    marginBottom: spacing.lg,
  },

  // Banner modo cofrade
  cofradeBanner: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 0.5,
    borderColor: colors.gold,
    borderRadius: radii.md,
    padding: spacing.md,
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

  // Modal de código de acceso / elegir procesión (ver CofradeContext).
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCodigo: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 360,
  },
  modalTitulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
  },
  modalSubtitulo: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  modalError: {
    color: colors.redText,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: spacing.sm,
  },
  modalVolverButton: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
  },
  modalVolverTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  modalProcesionItem: {
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  modalProcesionNombre: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 15,
  },
  modalProcesionMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },

  // Cerrar sesión -- mismo granate que en PerfilScreen de Ciudadano.
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
