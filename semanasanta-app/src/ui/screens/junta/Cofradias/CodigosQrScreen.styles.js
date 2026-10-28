import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';
import { radii } from '../../../../theme';
import { spacing } from '../../../../theme';

// Lo propio de CodigosQrScreen; el resto (tarjetas, botón, títulos) se
// reutiliza de CodigosAccesoScreen.styles.
export const styles = StyleSheet.create({
  cofradia: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  gestionar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    marginTop: spacing.sm,
  },
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
    maxHeight: 420,
  },
  modalTitulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modalItemTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },
});
