import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

// Mockup "Mapa en Vivo" (2026-10-03): título grande, mapa en tarjeta con
// borde dorado, píldora "En curso" arriba a la derecha, leyenda abajo a la
// izquierda y lista "En movimiento" debajo.
export const styles = StyleSheet.create({
  pantalla: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleRegular,
    fontSize: 40,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.titleRegular,
    fontSize: 15,
    marginBottom: spacing.md,
  },

  mapaCard: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.subtitle,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
  },

  pildoraEnCurso: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenBackground,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pildoraTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
  },

  // Por encima del logo de Google (abajo a la izquierda), que las
  // condiciones de Google Maps obligan a dejar visible.
  leyenda: {
    position: 'absolute',
    left: spacing.sm,
    bottom: 36,
    gap: 4,
    backgroundColor: 'rgba(30,16,8,0.9)',
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  leyendaFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
  },
  puntoVerde: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGreenText,
  },
  puntoAzul: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ubicacionUsuario,
  },

  // Marcadores sobre el mapa: cabeza (círculo verde con cruz) y cola.
  marcadorCabeza: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.lightGreenText,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorCola: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lightGreenText,
    borderWidth: 2,
    borderColor: colors.cream,
  },

  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.titleRegular,
    fontSize: 20,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  // Altura limitada para que el mapa siga siendo lo principal aunque haya
  // varias procesiones en curso a la vez.
  lista: {
    flexGrow: 0,
    maxHeight: 150,
  },
  listaContenido: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  // Tarjeta de "En movimiento" cuando no hay ninguna procesión en curso.
  vacioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  puntoGrisGrande: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.statusFinalizada,
  },
  vacioTexto: {
    flex: 1,
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
  },
  // Las tarjetas en sí: ver components/common/ProcesionCardMap.
});
