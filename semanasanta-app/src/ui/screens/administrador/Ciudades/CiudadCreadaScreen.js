import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './CiudadCreadaScreen.styles';

export function CiudadCreadaScreen({ route, navigation }) {
  const { nombreCiudad } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Ciudad Creada</Text>
      <Text style={styles.subtitle}>La ciudad de {nombreCiudad} se ha creado correctamente.</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('Ciudades')}
        activeOpacity={0.85}
      >
        <Text style={styles.botonTexto}>Ok</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
