import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { useCiudad } from '../../../application/context/CiudadContext';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

export function PerfilScreen({ navigation }) {
  const { ciudadSeleccionada } = useCiudad();

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.sectionTitle}>Ciudad seleccionada</Text>
      <View style={styles.ciudadCard}>
        <View>
          <Text style={styles.ciudadNombre}>{ciudadSeleccionada?.nombre}</Text>
          <Text style={styles.ciudadMeta}>{ciudadSeleccionada?.numProcesiones} procesiones</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('SeleccionCiudad')}>
          <Text style={styles.cambiar}>Cambiar</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Próximamente</Text>
      <Text style={styles.body}>
        Favoritos, modo cofrade y preferencias de notificaciones se irán añadiendo en las siguientes
        iteraciones.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleBold,
    fontSize: 32,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  ciudadCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  ciudadNombre: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 20,
  },
  ciudadMeta: {
    color: colors.goldMuted,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 12,
    marginTop: 2,
  },
  cambiar: {
    color: colors.gold,
    fontFamily: fontFamilies.uiSemiBold,
    fontSize: 14,
  },
  body: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
  },
});
