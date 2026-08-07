import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { useCiudad } from '../../../../application/context';
import { guardarModoAcceso } from '../../../../data/services';
import { resolverPantallaCiudadano } from '../../../utils/arranqueCiudadano';
import { colors } from '../../../../theme';
import { styles } from './WelcomeScreen.styles';

// Puerta de entrada de la app: el Ciudadano no se registra (entra directo,
// aquí solo elige seguir sin cuenta), mientras que Cofrades, Juntas de
// Cofradía y Administradores sí tienen cuenta y pasan por Iniciar sesión.
export function WelcomeScreen({ navigation }) {
  const { seleccionarCiudad } = useCiudad();
  const [cargando, setCargando] = useState(false);

  async function continuarComoCiudadano() {
    if (cargando) return;
    setCargando(true);
    await guardarModoAcceso('ciudadano');
    const pantalla = await resolverPantallaCiudadano(seleccionarCiudad);
    navigation.reset({ index: 0, routes: [{ name: pantalla }] });
  }

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.contenido}>
        <MaterialCommunityIcons name="cross" size={56} color={colors.gold} />
        <Text style={styles.title}>Semana Santa</Text>
        <Text style={styles.subtitle}>Vive la Semana Santa de tu ciudad, procesión a procesión.</Text>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity
          style={styles.botonPrimario}
          onPress={continuarComoCiudadano}
          activeOpacity={0.85}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.botonPrimarioTexto}>Continuar como Ciudadano o Cofrade</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
          disabled={cargando}
        >
          <Text style={styles.botonSecundarioTexto}>Iniciar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.nota}>Juntas de Cofradía y Administradores acceden aquí con su cuenta.</Text>
      </View>
    </ScreenContainer>
  );
}
