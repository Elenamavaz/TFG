import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  getCiudadPorId,
  crearCiudad,
  actualizarCiudad,
  eliminarCiudad,
  getJuntasCofradias,
} from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioCiudadScreen.styles';

// Formulario compartido entre "Nueva ciudad" y "Editar ciudad" (mockup del
// 2026-08-16): si llega ciudadId por params, es edición (precarga datos,
// muestra el interruptor "Ciudad activa", el botón Eliminar y la sección de
// Junta asignada -con enlace directo a crear una nueva Junta para ESTA
// ciudad, ver FormularioJuntaScreen); si no, es alta nueva, con "Cancelar"
// en vez de "Eliminar" y sin sección de Junta -la ciudad todavía no existe,
// no hay a qué asignarla.
export function FormularioCiudadScreen({ route, navigation }) {
  const ciudadId = route.params?.ciudadId ?? null;
  const editando = ciudadId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(editando);
  const [nombre, setNombre] = useState('');
  const [provincia, setProvincia] = useState('');
  const [historia, setHistoria] = useState('');
  const [patrimonio, setPatrimonio] = useState('');
  const [activa, setActiva] = useState(true);
  const [comunidadAutonoma, setComunidadAutonoma] = useState(null); // no está en el mockup, se conserva tal cual venía
  const [junta, setJunta] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  // Errores de validación del backend (400 de @Valid, ver GlobalExceptionHandler
  // y apiClient), uno por campo -se pintan debajo del TextInput que falló en
  // vez de como aviso genérico, ver también FormularioJuntaScreen/EditarPerfilScreen.
  const [erroresCampos, setErroresCampos] = useState({});

  function cambiarNombre(texto) {
    setNombre(texto);
    if (erroresCampos.nombre) setErroresCampos((actual) => ({ ...actual, nombre: null }));
  }

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: editando ? 'Editar ciudad' : 'Nueva ciudad',
    });
  }, [navigation, editando]);

  useEffect(() => {
    if (!editando) return;
    Promise.all([getCiudadPorId(ciudadId), getJuntasCofradias()]).then(([ciudad, juntas]) => {
      setNombre(ciudad.nombre);
      setProvincia(ciudad.provincia ?? '');
      setHistoria(ciudad.historia ?? '');
      setPatrimonio(ciudad.patrimonio ?? '');
      setActiva(ciudad.activa);
      setComunidadAutonoma(ciudad.comunidadAutonoma);
      setJunta(juntas.find((j) => j.ciudadId === ciudad.id) ?? null);
      setCargandoDatos(false);
    });
  }, [ciudadId, editando]);

  function datosFormulario() {
    return {
      nombre: nombre.trim(),
      comunidadAutonoma,
      provincia: provincia.trim() || null,
      historia: historia.trim() || null,
      patrimonio: patrimonio.trim() || null,
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
        await actualizarCiudad(ciudadId, datosFormulario());
        navigation.goBack();
      } else {
        const ciudadCreada = await crearCiudad(datosFormulario());
        navigation.replace('CiudadCreada', { nombreCiudad: ciudadCreada.nombre });
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
    Alert.alert('Eliminar ciudad', `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await eliminarCiudad(ciudadId);
          navigation.navigate('Ciudades');
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
          <Text style={styles.etiqueta}>Nombre de la ciudad</Text>
          <TextInput value={nombre} onChangeText={cambiarNombre} style={styles.input} />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Provincia</Text>
          <TextInput value={provincia} onChangeText={setProvincia} style={styles.input} />
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

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Patrimonio</Text>
          <TextInput
            value={patrimonio}
            onChangeText={setPatrimonio}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.inputMultilinea]}
          />
        </View>

        {editando ? (
          <View style={styles.activaRow}>
            <Text style={styles.etiqueta}>Ciudad activa</Text>
            <Switch
              value={activa}
              onValueChange={setActiva}
              trackColor={{ false: colors.surfaceAlt, true: colors.gold }}
              thumbColor={colors.cream}
            />
          </View>
        ) : null}

        {editando ? (
          <>
            <Text style={styles.etiqueta}>Junta de Cofradías asignada</Text>
            <View style={styles.juntaBox}>
              <Text style={styles.juntaTexto}>{junta ? `${junta.nombre} (${junta.email})` : 'Sin asignar todavía'}</Text>
            </View>
            {!junta ? (
              <TouchableOpacity
                style={styles.juntaCrearButton}
                onPress={() => navigation.navigate('FormularioJunta', { ciudadIdPreseleccionada: ciudadId })}
                activeOpacity={0.85}
              >
                <Text style={styles.juntaCrearTexto}>+ Crear nueva Junta de Cofradías</Text>
              </TouchableOpacity>
            ) : null}
          </>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || !nombre.trim()}
        >
          {guardando ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.botonTexto}>{editando ? 'Guardar' : 'Crear'}</Text>
          )}
        </TouchableOpacity>

        {editando ? (
          <TouchableOpacity style={styles.eliminarButton} onPress={confirmarEliminar} activeOpacity={0.85}>
            <Text style={styles.eliminarTexto}>Eliminar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelarButton} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.cancelarTexto}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
