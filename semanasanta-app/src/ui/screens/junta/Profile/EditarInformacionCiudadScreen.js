import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { ScreenContainer } from '../../../components/common';
import { getCiudadPorId, actualizarInformacionCiudad } from '../../../../data/services';
import { colors } from '../../../../theme';
import { styles } from './EditarInformacionCiudadScreen.styles';

// La Junta edita la historia y el patrimonio de SU ciudad (2026-10-03, a
// petición de Elena) -lo que ve el ciudadano en el detalle de la ciudad.
// Nombre, comunidad autónoma, coordenadas y "activa" no aparecen: siguen
// siendo cosa del Administrador (FormularioCiudadScreen). ciudadId llega de
// PerfilJuntaScreen, que ya lo tiene resuelto para "Ciudad gestionada"; el
// backend comprueba igualmente que es la ciudad de esta Junta.
export function EditarInformacionCiudadScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombreCiudad, setNombreCiudad] = useState('');
  const [historia, setHistoria] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Información de la ciudad',
    });
  }, [navigation]);

  useEffect(() => {
    getCiudadPorId(ciudadId)
      .then((ciudad) => {
        setNombreCiudad(ciudad.nombre);
        setHistoria(ciudad.historia ?? '');
        setPatrimonio(ciudad.patrimonio ?? '');
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargandoDatos(false));
  }, [ciudadId]);

  async function guardar() {
    if (guardando) return;
    setError(null);
    setGuardando(true);
    try {
      await actualizarInformacionCiudad(ciudadId, {
        historia: historia.trim() || null,
        patrimonio: patrimonio.trim() || null,
      });
      navigation.goBack();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargandoDatos) {
    return (
      <ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.titulo}>{nombreCiudad}</Text>
        <Text style={styles.explicacion}>Esta información la verán los ciudadanos en la página de la ciudad.</Text>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Historia</Text>
          <TextInput
            value={historia}
            onChangeText={setHistoria}
            multiline
            numberOfLines={6}
            style={[styles.input, styles.inputMultilinea]}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Patrimonio</Text>
          <TextInput
            value={patrimonio}
            onChangeText={setPatrimonio}
            multiline
            numberOfLines={6}
            style={[styles.input, styles.inputMultilinea]}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>Guardar</Text>}
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
