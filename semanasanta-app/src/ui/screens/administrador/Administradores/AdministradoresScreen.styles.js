import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';
import { fontFamilies } from '../../../../theme';

// Lo propio de AdministradoresScreen; el resto (tarjetas, botón, títulos) se
// reutiliza de MiembrosScreen.styles.
export const styles = StyleSheet.create({
  cardDatos: {
    flex: 1,
  },
  cardEmail: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
});
