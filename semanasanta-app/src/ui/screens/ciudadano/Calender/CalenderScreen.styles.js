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
  subtitle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginTop: 4,
  },

  // Vista de mes
  mesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  mesTitulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 24,
  },
  diasSemanaRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  diaSemanaLetra: {
    flex: 1,
    textAlign: 'center',
    color: colors.gold,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 13,
  },
  semanaGridRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  diaCelda: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaCeldaActiva: {
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
  },
  diaNumero: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 22,
  },
  diaNumeroActivo: {
    color: colors.background,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 20,
  },
  puntoAgenda: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  puntoAgendaActivo: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.background,
  },
  leyendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  leyendaTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
  },

  // Vista de semana + agenda
  volverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  volverTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 13,
  },
  semanaNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  semanaRow: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  semanaCelda: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
  },
  semanaCeldaActiva: {
    backgroundColor: colors.gold,
  },
  semanaLetra: {
    color: colors.gold,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 12,
  },
  semanaNumero: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginTop: 2,
  },
  semanaTextoActivo: {
    color: colors.background,
  },
  resumenDia: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  empty: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    marginTop: spacing.sm,
  },
});
