import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

// Mockup "Mapa en Vivo": punto a la izquierda, textos en el centro y botón
// de centrar a la derecha, en una sola fila.
export const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textos: {
    flex: 1,
  },
  titulo: {
    color: colors.cream,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
  },
  ruta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 11,
    marginTop: 2,
  },
  boton: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
