import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camara: {
    flex: 1,
  },
  sinPermiso: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  sinPermisoTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  boton: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  botonTexto: {
    color: colors.background,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 15,
  },
  pie: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
  },
  instrucciones: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    textAlign: 'center',
  },
  cerrar: {
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  cerrarTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
});
