import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCofradiasGestion, getPasoPorId, crearPaso, actualizarPaso, eliminarPaso } from '../../../../data/services';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioPasoScreen.styles';

// Formulario compartido entre "Crear paso" y "Editar paso" (mockup del
// 2026-08-22), mismo patrón que FormularioProcesionScreen para el selector
// de Cofradia (una sola, obligatoria -PasoRequest.cofradiaId).
//
// Dos diferencias respecto al mockup, ambas a petición de Elena:
// - "Web Oficial" se ha quitado: Paso no tiene ese campo en el backend
//   (PasoRequest: nombre/historia/analisisArtistico/imagen/cofradiaId).
// - "Importar archivo imagen" pasa a ser un campo de texto con la URL: no
//   hay ninguna infraestructura de subida de ficheros en el backend, y
//   Paso.imagen ya es solo un String pensado para eso.
export function FormularioPasoScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const pasoId = route.params?.pasoId ?? null;
  const editando = pasoId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombre, setNombre] = useState('');
  const [cofradiasDisponibles, setCofradiasDisponibles] = useState([]);
  const [cofradiaSeleccionada, setCofradiaSeleccionada] = useState(null);
  const [modalCofradiaVisible, setModalCofradiaVisible] = useState(false);
  const [historia, setHistoria] = useState('');
  const [analisisArtistico, setAnalisisArtistico] = useState('');
  const [imagen, setImagen] = useState('');
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
      title: editando ? 'Editar paso' : 'Crear paso',
    });
  }, [navigation, editando]);

  useEffect(() => {
    Promise.all([getCofradiasGestion(ciudadId), editando ? getPasoPorId(pasoId) : Promise.resolve(null)]).then(
      ([cofradias, paso]) => {
        setCofradiasDisponibles(cofradias);
        if (paso) {
          setNombre(paso.nombre);
          setCofradiaSeleccionada(cofradias.find((c) => c.id === paso.cofradiaId) ?? null);
          setHistoria(paso.historia ?? '');
          setAnalisisArtistico(paso.analisisArtistico ?? '');
          setImagen(paso.imagen ?? '');
        }
        setCargandoDatos(false);
      }
    );
  }, [ciudadId, pasoId, editando]);

  function datosFormulario() {
    return {
      nombre: nombre.trim(),
      historia: historia.trim() || null,
      analisisArtistico: analisisArtistico.trim() || null,
      imagen: imagen.trim() || null,
      cofradiaId: cofradiaSeleccionada?.id,
    };
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      if (editando) {
        await actualizarPaso(pasoId, datosFormulario());
        navigation.replace('PasoActualizado', { ciudadId });
      } else {
        const pasoCreado = await crearPaso(datosFormulario());
        navigation.replace('PasoCreado', { nombrePaso: pasoCreado.nombre, ciudadId });
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
    Alert.alert('Eliminar paso', `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarPaso(pasoId);
            navigation.navigate('Pasos', { ciudadId });
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
          <Text style={styles.etiqueta}>Nombre del paso</Text>
          <TextInput value={nombre} onChangeText={cambiarNombre} style={styles.input} />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Cofradia</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setModalCofradiaVisible(true)} activeOpacity={0.8}>
            <Text style={cofradiaSeleccionada ? styles.selectorTexto : styles.selectorPlaceholder}>
              {cofradiaSeleccionada ? cofradiaSeleccionada.nombre : 'Seleccionar una existente'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.subtitle} />
          </TouchableOpacity>
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
          <Text style={styles.etiqueta}>Análisis Artístico y Detalles</Text>
          <TextInput
            value={analisisArtistico}
            onChangeText={setAnalisisArtistico}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.inputMultilinea]}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Imagen</Text>
          <TextInput
            value={imagen}
            onChangeText={setImagen}
            placeholder="URL de la imagen"
            placeholderTextColor={colors.subtitle}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.input}
          />
          <Text style={styles.ayuda}>Pega la URL de una imagen ya subida (JPG, JPEG o PNG).</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || eliminando || !nombre.trim() || !cofradiaSeleccionada}
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

      <Modal transparent visible={modalCofradiaVisible} animationType="fade" onRequestClose={() => setModalCofradiaVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalCofradiaVisible(false)}>
          <View style={styles.modalLista}>
            {cofradiasDisponibles.length === 0 ? (
              <Text style={styles.modalVacio}>No hay cofradías todavía en esta ciudad.</Text>
            ) : (
              cofradiasDisponibles.map((cofradia) => (
                <TouchableOpacity
                  key={cofradia.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setCofradiaSeleccionada(cofradia);
                    setModalCofradiaVisible(false);
                  }}
                >
                  <Text style={styles.modalItemTexto}>{cofradia.nombre}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
