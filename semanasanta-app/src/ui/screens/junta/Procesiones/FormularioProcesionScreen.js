import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  getCofradiasPorCiudad,
  getDiasSemanaSanta,
  getProcesionPorId,
  getPasosPorCofradia,
  crearProcesion,
  actualizarProcesion,
  eliminarProcesion,
  importarGpxRecorrido,
} from '../../../../data/services';
import { combinarFechaHora, sumarMinutos, formatearDuracionCorta, parsearDuracionCorta } from '../../../../data/utils/fechaSemanaSanta';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioProcesionScreen.styles';

// Formulario compartido entre "Nueva procesión" y "Editar procesión" (mockup
// del 2026-08-20), mismo patrón que el resto del panel -salvo que aquí,
// a petición explícita de Elena ("mejor deja asi la interfaz"), el botón de
// guardar dice "Crear" en los dos modos (no "Guardar" en edición) y
// "Cancelar" (rojo) también aparece en los dos -no hay "Eliminar" aquí, se
// hace desde la lista.
//
// Cofradía y ubicación no estaban en el mockup original pero el backend los
// necesita (ubicacionId ya no, ver V32 -una procesión no tiene un único
// punto, tiene un recorrido); Cofradía si hace falta añadirla, confirmado
// por Elena: selector de una sola cofradía (cofradiaIds solo lleva una).
//
// Día/Salida/Duración son sueltos en el mockup pero el backend solo guarda
// fecha/fechaInicio/fechaFin -se combinan aquí (ver fechaSemanaSanta.js) y
// se deshacen igual al cargar una procesión existente para editar.
export function FormularioProcesionScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const procesionId = route.params?.procesionId ?? null;
  const editando = procesionId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombre, setNombre] = useState('');
  const [cofradiasDisponibles, setCofradiasDisponibles] = useState([]);
  const [cofradiaSeleccionada, setCofradiaSeleccionada] = useState(null);
  const [modalCofradiaVisible, setModalCofradiaVisible] = useState(false);
  const [numPasos, setNumPasos] = useState(0); // candidatos: pasos de la cofradía elegida (solo mientras se crea, ver JSX)
  const [numPasosAsignados, setNumPasosAsignados] = useState(0); // los que YA participan en esta procesión (editando)
  const [diasSemanaSanta, setDiasSemanaSanta] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalDiaVisible, setModalDiaVisible] = useState(false);
  const [horaSalida, setHoraSalida] = useState('');
  const [duracionTexto, setDuracionTexto] = useState('0h 0min');
  const [webOficial, setWebOficial] = useState('');
  const [historia, setHistoria] = useState('');
  const [tradicion, setTradicion] = useState('');
  const [recorridoId, setRecorridoId] = useState(null);
  const [recorridoInfo, setRecorridoInfo] = useState(null);
  const [importandoGpx, setImportandoGpx] = useState(false);
  const [errorGpx, setErrorGpx] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});

  function cambiarCampo(setter, campo) {
    return (texto) => {
      setter(texto);
      if (erroresCampos[campo]) setErroresCampos((actual) => ({ ...actual, [campo]: null }));
    };
  }

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: editando ? 'Editar procesión' : 'Nueva procesión',
    });
  }, [navigation, editando]);

  useEffect(() => {
    Promise.all([
      getCofradiasPorCiudad(ciudadId),
      getDiasSemanaSanta(),
      editando ? getProcesionPorId(procesionId) : Promise.resolve(null),
    ]).then(([cofradias, dias, procesion]) => {
      setCofradiasDisponibles(cofradias);
      setDiasSemanaSanta(dias);

      if (procesion) {
        const cofradia = cofradias.find((c) => procesion.cofradiaIds.includes(c.id)) ?? null;
        setNombre(procesion.nombre);
        setCofradiaSeleccionada(cofradia);
        if (cofradia) {
          getPasosPorCofradia(cofradia.id).then((pasos) => setNumPasos(pasos.length));
        }
        setDiaSeleccionado(dias.find((d) => d.nombre === procesion.dia) ?? null);
        setHoraSalida(procesion.horaSalida ?? '');
        setDuracionTexto(formatearDuracionCorta(procesion.duracionMin ?? 0));
        setWebOficial(procesion.web ?? '');
        setHistoria(procesion.historia ?? '');
        setTradicion(procesion.tradicion ?? '');
        setRecorridoId(procesion.recorridoId);
        if (procesion.recorridoId) {
          setRecorridoInfo(`Recorrido ya importado (id ${procesion.recorridoId})`);
        }
        setNumPasosAsignados(procesion.pasoIds.length);
      }
      setCargandoDatos(false);
    });
  }, [ciudadId, procesionId, editando]);

  function seleccionarCofradia(cofradia) {
    setCofradiaSeleccionada(cofradia);
    setModalCofradiaVisible(false);
    getPasosPorCofradia(cofradia.id).then((pasos) => setNumPasos(pasos.length));
  }

  async function importarGpx() {
    if (importandoGpx) return;
    const resultado = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (resultado.canceled) return;

    const archivo = resultado.assets[0];
    setImportandoGpx(true);
    setErrorGpx(null);
    try {
      const recorrido = await importarGpxRecorrido(archivo);
      setRecorridoId(recorrido.id);
      setRecorridoInfo(
        `${archivo.name} importado -${recorrido.distanciaTotal != null ? `${recorrido.distanciaTotal} km` : 'ruta sin distancia calculada'}`
      );
    } catch (err) {
      setErrorGpx(err.message);
    } finally {
      setImportandoGpx(false);
    }
  }

  function datosFormulario() {
    const fechaInicio = combinarFechaHora(diaSeleccionado?.fecha, horaSalida);
    const duracionMin = parsearDuracionCorta(duracionTexto);
    return {
      nombre: nombre.trim(),
      historia: historia.trim() || null,
      tradicion: tradicion.trim() || null,
      fecha: fechaInicio,
      cofradiaIds: cofradiaSeleccionada ? [cofradiaSeleccionada.id] : [],
      ubicacionId: null,
      web: webOficial.trim() || null,
      fechaInicio,
      fechaFin: sumarMinutos(fechaInicio, duracionMin),
      recorridoId,
      pasosIds: null,
    };
  }

  async function guardar() {
    if (guardando) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      if (editando) {
        await actualizarProcesion(procesionId, datosFormulario());
        navigation.replace('ProcesionActualizada', { nombreProcesion: nombre.trim(), ciudadId, procesionId });
      } else {
        const procesionCreada = await crearProcesion(datosFormulario());
        navigation.replace('ProcesionCreada', { nombreProcesion: procesionCreada.nombre, ciudadId, procesionId: procesionCreada.id });
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

  // Mismo patrón que FormularioMiembroScreen (2026-08-20, ver memoria del
  // TFG): alineado con Ciudad/Junta/Miembro -Elena quería "Eliminar" en el
  // formulario, no solo en la lista (que tampoco lo tenía). A diferencia de
  // Miembro, aquí "Cancelar" (descartar el formulario) se queda visible en
  // los dos modos -decisión ya tomada el mismo día para Procesion-, así que
  // en edición conviven Crear/Cancelar/Eliminar, no es mutuamente excluyente.
  function confirmarEliminar() {
    Alert.alert('Eliminar procesión', `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarProcesion(procesionId);
            navigation.navigate('Procesiones', { ciudadId });
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
          <Text style={styles.etiqueta}>Nombre de la procesión</Text>
          <TextInput value={nombre} onChangeText={cambiarCampo(setNombre, 'nombre')} style={styles.input} />
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

        <View style={styles.filaCompacta}>
          <View style={styles.campoCompacto}>
            <View style={styles.etiquetaCompacta}>
              <Ionicons name="calendar-outline" size={12} color={colors.subtitle} />
              <Text style={styles.etiquetaCompactaTexto}>Día</Text>
            </View>
            <TouchableOpacity style={styles.selectorCompacto} onPress={() => setModalDiaVisible(true)} activeOpacity={0.8}>
              <Text style={diaSeleccionado ? styles.selectorTextoCompacto : styles.selectorPlaceholderCompacto} numberOfLines={1}>
                {diaSeleccionado ? diaSeleccionado.nombre : 'Seleccionar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.campoCompacto}>
            <View style={styles.etiquetaCompacta}>
              <Ionicons name="time-outline" size={12} color={colors.subtitle} />
              <Text style={styles.etiquetaCompactaTexto}>Salida</Text>
            </View>
            <TextInput
              value={horaSalida}
              onChangeText={setHoraSalida}
              placeholder="00:00"
              placeholderTextColor={colors.subtitle}
              style={styles.inputCompacto}
            />
          </View>

          <View style={styles.campoCompacto}>
            <View style={styles.etiquetaCompacta}>
              <Ionicons name="hourglass-outline" size={12} color={colors.subtitle} />
              <Text style={styles.etiquetaCompactaTexto}>Duración</Text>
            </View>
            <TextInput
              value={duracionTexto}
              onChangeText={setDuracionTexto}
              placeholder="0h 0min"
              placeholderTextColor={colors.subtitle}
              style={styles.inputCompacto}
            />
          </View>
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Web Oficial</Text>
          <TextInput
            value={webOficial}
            onChangeText={setWebOficial}
            autoCapitalize="none"
            keyboardType="url"
            style={styles.input}
          />
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
          <Text style={styles.etiqueta}>Tradiccion</Text>
          <TextInput
            value={tradicion}
            onChangeText={setTradicion}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.inputMultilinea]}
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Recorrido</Text>
          <TouchableOpacity style={styles.importarButton} onPress={importarGpx} activeOpacity={0.85} disabled={importandoGpx}>
            {importandoGpx ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={16} color={colors.gold} />
                <Text style={styles.importarTexto}>Importar archivo gpx</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.ayuda}>
            Para cambiar el recorrido actual, importa un archivo GPX con el trazado de la ruta nueva
          </Text>
          {recorridoInfo ? <Text style={styles.recorridoInfo}>{recorridoInfo}</Text> : null}
          {errorGpx ? <Text style={styles.errorCampo}>{errorGpx}</Text> : null}
          {recorridoId ? (
            // Solo con un recorrido ya importado tiene sentido marcar
            // encuentros/iglesias/paradas sobre sus puntos (2026-08-23, ver
            // EditarRecorridoScreen) -antes de importar el GPX no hay
            // ningún punto todavía que marcar.
            <TouchableOpacity
              style={styles.editarRecorridoButton}
              onPress={() => navigation.navigate('EditarRecorrido', { recorridoId })}
              activeOpacity={0.85}
            >
              <Ionicons name="location-outline" size={16} color={colors.gold} />
              <Text style={styles.editarRecorridoTexto}>Editar recorrido</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Editando: "Lista de pasos" muestra los que YA participan en ESTA
            procesión (pasoIds, ver SeleccionarPasosScreen) -no los de una
            sola cofradía. Una procesión puede tener varias cofradías
            (cofradiaIds), y SeleccionarPasosScreen ya reúne los pasos de
            TODAS ellas, no solo de la que se ve seleccionada aquí (el
            selector de este formulario solo deja elegir una, pero el
            backend admite más -ver comentario de arriba). Creando: todavía
            no hay procesión a la que asignar pasos, así que se muestran los
            de la cofradía elegida como candidatos a título informativo. */}
        {editando ? (
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Elementos de la Procesion</Text>
            <TouchableOpacity
              style={styles.pasosRow}
              onPress={() => navigation.navigate('SeleccionarPasos', { procesionId, ciudadId })}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.pasosTitulo}>Lista de pasos</Text>
                <Text style={styles.pasosMeta}>{numPasosAsignados} pasos</Text>
              </View>
              <View style={styles.pasosVerLista}>
                <Text style={styles.pasosVerListaTexto}>Ver Lista</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.gold} />
              </View>
            </TouchableOpacity>
          </View>
        ) : cofradiaSeleccionada ? (
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Pasos de la cofradia</Text>
            <TouchableOpacity
              style={styles.pasosRow}
              onPress={() => navigation.navigate('Pasos', { ciudadId, cofradiaIdInicial: cofradiaSeleccionada.id })}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.pasosTitulo}>Lista de pasos</Text>
                <Text style={styles.pasosMeta}>{numPasos} pasos (se asignan al guardar)</Text>
              </View>
              <View style={styles.pasosVerLista}>
                <Text style={styles.pasosVerListaTexto}>Ver Lista</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.gold} />
              </View>
            </TouchableOpacity>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.boton, guardando && styles.botonDeshabilitado]}
          onPress={guardar}
          activeOpacity={0.85}
          disabled={guardando || eliminando || !nombre.trim() || !cofradiaSeleccionada}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>Crear</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelarButton, (guardando || eliminando) && styles.botonDeshabilitado]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          disabled={guardando || eliminando}
        >
          <Text style={styles.cancelarTexto}>Cancelar</Text>
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
        ) : null}
      </ScrollView>

      <Modal transparent visible={modalCofradiaVisible} animationType="fade" onRequestClose={() => setModalCofradiaVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalCofradiaVisible(false)}>
          <View style={styles.modalLista}>
            {cofradiasDisponibles.length === 0 ? (
              <Text style={styles.modalVacio}>No hay cofradías todavía en esta ciudad.</Text>
            ) : (
              cofradiasDisponibles.map((cofradia) => (
                <TouchableOpacity key={cofradia.id} style={styles.modalItem} onPress={() => seleccionarCofradia(cofradia)}>
                  <Text style={styles.modalItemTexto}>{cofradia.nombre}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={modalDiaVisible} animationType="fade" onRequestClose={() => setModalDiaVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalDiaVisible(false)}>
          <View style={styles.modalLista}>
            {diasSemanaSanta.map((dia) => (
              <TouchableOpacity
                key={dia.id}
                style={styles.modalItem}
                onPress={() => {
                  setDiaSeleccionado(dia);
                  setModalDiaVisible(false);
                }}
              >
                <Text style={styles.modalItemTexto}>{dia.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
