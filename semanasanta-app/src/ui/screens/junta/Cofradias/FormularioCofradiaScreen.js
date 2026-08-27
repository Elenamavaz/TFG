import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getCofradiaPorId, crearCofradia, actualizarCofradia, eliminarCofradia } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioCofradiaScreen.styles';

// Formulario compartido entre "Nueva cofradia" y "Editar cofradia" (mockup
// del 2026-08-22), mismo patrón que FormularioCiudadScreen: en edición se
// añade el interruptor "Cofradia activa" y el botón Eliminar; en alta,
// "Cancelar" en su lugar.
//
// "Nº estimado de cofrades" del mockup se ha quitado (a petición de Elena):
// no hay Cofrades guardados que contar en vivo (un Cofrade es un JWT
// anónimo, no una fila -ver PosicionActualService), así que ese número solo
// podría ser un campo suelto escrito a mano -mismo caso que
// Ciudad.numCofradiasEstimado, añadido y quitado el mismo día porque
// "no aportaba nada, se queda desactualizado".
export function FormularioCofradiaScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const cofradiaId = route.params?.cofradiaId ?? null;
  const editando = cofradiaId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(editando);
  const [nombre, setNombre] = useState('');
  const [web, setWeb] = useState('');
  const [historia, setHistoria] = useState('');
  const [activa, setActiva] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});

  function cambiarNombre(texto) {
    setNombre(texto);
    if (erroresCampos.nombre) setErroresCampos((actual) => ({ ...actual, nombre: null }));
  }

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: editando ? 'Editar cofradia' : 'Nueva cofradia',
    });
  }, [navigation, editando]);

  useEffect(() => {
    if (!editando) return;
    getCofradiaPorId(cofradiaId).then((cofradia) => {
      setNombre(cofradia.nombre);
      setWeb(cofradia.web ?? '');
      setHistoria(cofradia.historia ?? '');
      setActiva(cofradia.activa);
      setCargandoDatos(false);
    });
  }, [cofradiaId, editando]);

  function datosFormulario() {
    return {
      nombre: nombre.trim(),
      historia: historia.trim() || null,
      web: web.trim() || null,
      ciudadId,
      activa,
    };
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      if (editando) {
        await actualizarCofradia(cofradiaId, datosFormulario());
        navigation.goBack();
      } else {
        const cofradiaCreada = await crearCofradia(datosFormulario());
        navigation.replace('CofradiaCreada', { nombreCofradia: cofradiaCreada.nombre, ciudadId });
      }
    } catch (err) {
      if (err.campos) {
        setErroresCampos(err.campos);
      } else {
        setError(err.message);
      }
    } finally {
      setGuardando(false);
    }
  }

  function confirmarEliminar() {
    Alert.alert('Eliminar cofradía', `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarCofradia(cofradiaId);
            navigation.navigate('Cofradias', { ciudadId });
          } finally {
            setEliminando(false);
          }
        },
      },
    ]);
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
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Nombre de la cofradia</Text>
          <TextInput value={nombre} onChangeText={cambiarNombre} style={styles.input} />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Web oficial</Text>
          <TextInput value={web} onChangeText={setWeb} autoCapitalize="none" keyboardType="url" style={styles.input} />
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Historia</Text>
          <TextInput
            value={historia}
            onChangeText={setHistoria}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.inputMultilinea]}
          />
        </View>

        {editando ? (
          <View style={styles.activaRow}>
            <Text style={styles.etiqueta}>Cofradia activa</Text>
            <Switch
              value={activa}
              onValueChange={setActiva}
              trackColor={{ false: colors.surfaceAlt, true: colors.gold }}
              thumbColor={colors.cream}
            />
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || eliminando || !nombre.trim()}
        >
          {guardando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.botonTexto}>{editando ? 'Guardar' : 'Crear'}</Text>
          )}
        </TouchableOpacity>

        {editando ? (
          <TouchableOpacity
            style={[styles.eliminarButton, eliminando && styles.botonDeshabilitado]}
            onPress={confirmarEliminar}
            activeOpacity={0.85}
            disabled={guardando || eliminando}
          >
            {eliminando ? <ActivityIndicator color={colors.cream} /> : <Text style={styles.eliminarTexto}>Eliminar</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelarButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            disabled={guardando}
          >
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
