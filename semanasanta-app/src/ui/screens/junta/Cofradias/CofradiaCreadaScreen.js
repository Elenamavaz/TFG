import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './CofradiaCreadaScreen.styles';

// A diferencia de ProcesionCreadaScreen (que tenía "Añadir pasos ·
// Próximamente"), aquí los tres botones sí llevan a pantallas reales:
// Procesiones/Eventos/Pasos ya existen (mockup del 2026-08-22).
export function CofradiaCreadaScreen({ route, navigation }) {
  const { nombreCofradia, ciudadId } = route.params;

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Cofradia Creada</Text>
      <Text style={styles.subtitle}>
        La cofradía "{nombreCofradia}" se ha creado correctamente. Ahora puedes añadir sus procesiones, eventos y
        pasos, o continuar más tarde.
      </Text>

      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Procesiones', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Añadir procesiones</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Eventos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Añadir eventos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => navigation.navigate('Pasos', { ciudadId })} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Añadir pasos</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.masTardeButton}
        onPress={() => navigation.navigate('Cofradias', { ciudadId })}
        activeOpacity={0.85}
      >
        <Text style={styles.masTardeTexto}>Hacerlo más tarde</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
