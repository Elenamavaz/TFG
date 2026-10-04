import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { common } from '../../../components';
import { context } from '../../../../application';
import { services } from '../../../../data';
import { arranqueCiudadano } from '../../../utils';
import { colors } from '../../../../theme';
import { styles } from './WelcomeScreen.styles';

// Puerta de entrada de la app: el Ciudadano no se registra (entra directo,
// aquí solo elige seguir sin cuenta), mientras que Cofrades, Juntas de
// Cofradía y Administradores sí tienen cuenta y pasan por Iniciar sesión.
export function WelcomeScreen({ navigation }) {
  const { seleccionarCiudad } = context.useCiudad();
  const [cargando, setCargando] = useState(false);

  async function continuarComoCiudadano() {
    if (cargando) return;
    setCargando(true);
    await services.guardarModoAcceso('ciudadano');
    const pantalla = await arranqueCiudadano.resolverPantallaCiudadano(seleccionarCiudad);
    navigation.reset({ index: 0, routes: [{ name: pantalla }] });
  }

  return (
    <common.ScreenContainer style={styles.container}>
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
            <Text style={styles.botonPrimarioTexto}>Continuar como Ciudadano</Text>
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

        <Text style={styles.nota}>
          Cofrades (con su código de acceso), miembros de las Juntas de Cofradía y Administradores acceden aquí.
        </Text>
      </View>
    </common.ScreenContainer>
  );
}
