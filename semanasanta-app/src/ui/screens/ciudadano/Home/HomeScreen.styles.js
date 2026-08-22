import { StyleSheet } from 'react-native';
import { colors, fontFamilies, radii, spacing } from '../../../../theme';

export const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  ciudadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ciudad: {
    color: colors.gold,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
  },
  diaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 32,
  },
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 10,
  },
  // Columna a la derecha del header: "···" arriba (altura de ciudadRow) y el
  // botón de info debajo, alineado aprox. con diaRow (2026-08-21, mockup del
  // icono de libro "ver detalles" -> DetalleCiudad).
  headerButtons: {
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: spacing.xs,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  avisoCarrusel: {
    marginTop: spacing.lg,
  },
  // Sin backgroundColor/borderColor aquí: los pone HomeScreen según
  // Notificacion.colorCategoria (roja/naranja/verde).
  avisoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.md,
    borderWidth: 0.5,
    padding: spacing.md,
  },
  avisoTexto: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 12,
  },
  avisoDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  avisoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
  },
  avisoDotActivo: {
    backgroundColor: colors.gold,
  },
  enCursoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.greenBackground,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.greenBorder,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  enCursoLeft: {
    flex: 1,
    marginRight: spacing.sm,
  },
  enCursoTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 20,
    marginTop: spacing.xs,
  },
  enCursoMeta: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 10,
    marginTop: 2,
  },
  enCursoRight: {
    alignItems: 'flex-end',
  },
  enCursoHora: {
    color: colors.gold,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 20,
  },
  enCursoDuracion: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  statValue: {
    color: colors.cream,
    fontFamily: fontFamilies.titleBold,
    fontSize: 22,
    marginTop: spacing.xs,
  },
  statLabel: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 19,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: spacing.lg,
  },
  menu: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    paddingVertical: spacing.xs,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItemText: {
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 12,
  },
  overlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  diaMenu: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    paddingVertical: spacing.xs,
    width: '100%',
    maxWidth: 320,
  },
  diaMenuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  diaMenuItemActivo: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  diaMenuItemText: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 15,
  },
  diaMenuItemTextActivo: {
    color: colors.cream,
  },
  diaMenuItemFecha: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
  },
});
