import { Text, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../../components/common';
import { useCiudad } from '../../../../application/context';
import { styles } from './PerfilScreen.styles';

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
