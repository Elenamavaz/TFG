import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { services } from '../../../../data';
import { models } from '../../../../data';
import { fechaSemanaSanta } from '../../../../data';
import { common } from '../../../components';
import { colors } from '../../../../theme';
import { SelectorCofradias, contarPasosDeCofradias, pasosQueSiguenValiendo } from '../SelectorCofradias';
import { styles } from './FormularioProcesionScreen.styles';

// Formulario compartido entre "Nueva procesión" y "Editar procesión" (mockup
// del 2026-08-20), mismo patrón que el resto del panel -salvo que aquí
// "Cancelar" (rojo) aparece en los dos modos. El botón de guardar decía
// "Crear" también al editar (decisión del 2026-08-20); desde el 2026-10-03,
// a petición de Elena, dice "Guardar" al editar, como FormularioEventoScreen
// y el resto del panel.
//
// Cofradías: una procesión puede tener VARIAS (la Procesión General, el
// Rosario del Dolor, los Encuentros...), así que el selector es múltiple
// desde el 2026-10-21 (bug 37 de bugs.md): antes solo admitía una y al
// guardar se perdían las demás. Los pasos que se pueden asignar son los de
// todas las cofradías participantes (un paso pertenece a una sola, RF-30).
// Ubicación (templo de salida): el formulario no la edita, pero conserva la
// que ya tenga la procesión (bug 38: antes se mandaba siempre null y se
// borraba al guardar).
//
// Día/Salida/Duración son sueltos en el mockup pero el backend solo guarda
// fecha/fechaInicio/fechaFin -se combinan aquí (ver fechaSemanaSanta.js) y
// se deshacen igual al cargar una procesión existente para editar.
// Estado (2026-09-30): cambia solo a "En curso"/"Finalizado" al llegar la
// hora de salida/fin (CambioEstadoAutomaticoService del backend); este
// selector es la corrección manual. Pasar a "En curso"/"Finalizado" avisa
// solo a los ciudadanos (INICIO/FIN). "Cancelado" (añadido por Elena el
// 2026-10-02) cancela sin avisar: al guardar se abre "Crear Notificación"
// con la cancelación ya elegida, para dar motivo y prioridad.
const OPCIONES_ESTADO = [
  { valor: models.EstadoEvento.PROGRAMADO, etiqueta: 'Programado', background: colors.backgroundOrange, texto: colors.orangeText },
  { valor: models.EstadoEvento.EN_CURSO, etiqueta: 'En curso', background: colors.greenBackground, texto: colors.lightGreenText },
  { valor: models.EstadoEvento.FINALIZADO, etiqueta: 'Finalizado', background: colors.backgroundRed, texto: colors.redText },
  { valor: models.EstadoEvento.CANCELADO, etiqueta: 'Cancelado', background: colors.backgroundRed, texto: colors.redText },
];

export function FormularioProcesionScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const procesionId = route.params?.procesionId ?? null;
  const editando = procesionId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombre, setNombre] = useState('');
  const [cofradiasDisponibles, setCofradiasDisponibles] = useState([]);
  const [cofradiasSeleccionadas, setCofradiasSeleccionadas] = useState([]); // ids, ver SelectorCofradias
  const [numPasos, setNumPasos] = useState(0); // candidatos: pasos de las cofradías elegidas (solo mientras se crea, ver JSX)
  // Lo que tenía la procesión al abrir el formulario (editando): para no
  // perder su templo de salida y para depurar sus pasos si cambian las cofradías.
  const [ubicacionIdOriginal, setUbicacionIdOriginal] = useState(null);
  const [cofradiasOriginales, setCofradiasOriginales] = useState([]);
  const [pasoIdsOriginales, setPasoIdsOriginales] = useState([]);
  const [numPasosAsignados, setNumPasosAsignados] = useState(0); // los que YA participan en esta procesión (editando)
  const [diasSemanaSanta, setDiasSemanaSanta] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalDiaVisible, setModalDiaVisible] = useState(false);
  const [horaSalida, setHoraSalida] = useState('');
  const [duracionTexto, setDuracionTexto] = useState('0h 0min');
  const [webOficial, setWebOficial] = useState('');
  const [historia, setHistoria] = useState('');
  const [tradicion, setTradicion] = useState('');
  const [estado, setEstado] = useState(models.EstadoEvento.PROGRAMADO);
  const [estadoOriginal, setEstadoOriginal] = useState(models.EstadoEvento.PROGRAMADO);
  const [recorridoId, setRecorridoId] = useState(null);
  // GPX importado en ESTE formulario y aún sin guardar en la procesión. El
  // backend crea el recorrido al importarlo, así que si se importa otro o se
  // sale sin guardar, se quedaba huérfano en la base de datos (bug 26).
  const recorridoSinGuardarRef = useRef(null);
  const [recorridoInfo, setRecorridoInfo] = useState(null);
  const [importandoGpx, setImportandoGpx] = useState(false);
  const [errorGpx, setErrorGpx] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState(null);
  const [erroresCampos, setErroresCampos] = useState({});

  function limpiarError(campo) {
    if (erroresCampos[campo]) setErroresCampos((actual) => ({ ...actual, [campo]: null }));
  }

  function cambiarCampo(setter, campo) {
    return (texto) => {
      setter(texto);
      limpiarError(campo);
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
      // Incluidas las desactivadas, igual que FormularioEventoScreen (bug 24):
      // si no, al editar una procesión de una cofradía desactivada el campo
      // quedaba vacío y no dejaba guardar.
      services.getCofradiasGestion(ciudadId),
      services.getDiasSemanaSanta(),
      editando ? services.getProcesionPorId(procesionId) : Promise.resolve(null),
    ]).then(([cofradias, dias, procesion]) => {
      setCofradiasDisponibles(cofradias);
      setDiasSemanaSanta(dias);

      if (procesion) {
        setNombre(procesion.nombre);
        setCofradiasSeleccionadas(procesion.cofradiaIds);
        setCofradiasOriginales(procesion.cofradiaIds);
        setPasoIdsOriginales(procesion.pasoIds);
        setUbicacionIdOriginal(procesion.ubicacionId);
        contarPasosDeCofradias(procesion.cofradiaIds).then(setNumPasos).catch(() => {});
        setDiaSeleccionado(dias.find((d) => d.nombre === procesion.dia) ?? null);
        setHoraSalida(procesion.horaSalida ?? '');
        setDuracionTexto(fechaSemanaSanta.formatearDuracionCorta(procesion.duracionMin ?? 0));
        setWebOficial(procesion.web ?? '');
        setHistoria(procesion.historia ?? '');
        setTradicion(procesion.tradicion ?? '');
        setEstado(procesion.estado);
        setEstadoOriginal(procesion.estado);
        setRecorridoId(procesion.recorridoId);
        if (procesion.recorridoId) {
          setRecorridoInfo(`Recorrido ya importado (id ${procesion.recorridoId})`);
        }
        setNumPasosAsignados(procesion.pasoIds.length);
      }
      setCargandoDatos(false);
    });
  }, [ciudadId, procesionId, editando]);

  function cambiarCofradias(ids) {
    setCofradiasSeleccionadas(ids);
    limpiarError('cofradia');
    contarPasosDeCofradias(ids).then(setNumPasos).catch(() => {});
  }

  // Editando: si se ha quitado alguna cofradía, sus pasos salen también de
  // la procesión (null = el backend no toca los pasos).
  async function pasosParaGuardar() {
    if (!editando) return null;
    const quitadas = cofradiasOriginales.some((id) => !cofradiasSeleccionadas.includes(id));
    return quitadas ? pasosQueSiguenValiendo(pasoIdsOriginales, cofradiasSeleccionadas) : null;
  }

  async function importarGpx() {
    if (importandoGpx) return;
    const resultado = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
    if (resultado.canceled) return;

    const archivo = resultado.assets[0];
    setImportandoGpx(true);
    setErrorGpx(null);
    try {
      const recorrido = await services.importarGpxRecorrido(archivo);
      descartarRecorridoSinGuardar(); // el GPX importado antes en este mismo formulario
      recorridoSinGuardarRef.current = recorrido.id;
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

  function descartarRecorridoSinGuardar() {
    if (recorridoSinGuardarRef.current) {
      services.eliminarRecorrido(recorridoSinGuardarRef.current).catch(() => {});
      recorridoSinGuardarRef.current = null;
    }
  }

  // Al salir del formulario por cualquier vía (Cancelar, atrás, gesto) sin
  // haber guardado: el GPX importado no lo va a usar nadie. Al guardar se
  // limpia la referencia antes de navegar, así que no se borra.
  useEffect(() => navigation.addListener('beforeRemove', descartarRecorridoSinGuardar), [navigation]);

  function datosFormulario(pasosIds) {
    const fechaInicio = fechaSemanaSanta.combinarFechaHora(diaSeleccionado?.fecha, horaSalida.trim());
    const duracionMin = fechaSemanaSanta.parsearDuracionCorta(duracionTexto);
    return {
      nombre: nombre.trim(),
      historia: historia.trim() || null,
      tradicion: tradicion.trim() || null,
      fecha: fechaInicio,
      cofradiaIds: cofradiasSeleccionadas,
      ubicacionId: ubicacionIdOriginal,
      web: webOficial.trim() || null,
      fechaInicio,
      fechaFin: fechaSemanaSanta.sumarMinutos(fechaInicio, duracionMin),
      recorridoId,
      pasosIds,
      estado: editando ? estado : null, // al crear, el backend la deja PROGRAMADO
    };
  }

  // Campos obligatorios: el botón ya no se deshabilita en silencio cuando
  // falta alguno, se marca cada uno con su mensaje al pulsar "Crear".
  function validar() {
    const errores = {};
    if (!nombre.trim()) errores.nombre = 'El nombre de la procesión es obligatorio';
    if (cofradiasSeleccionadas.length === 0) errores.cofradia = 'Selecciona al menos una cofradía';
    if (!diaSeleccionado) errores.dia = 'Selecciona el día';
    if (!fechaSemanaSanta.esHoraValida(horaSalida)) errores.horaSalida = 'Indica la hora de salida (00:00)';
    return errores;
  }

  async function guardar() {
    if (guardando) return;
    const errores = validar();
    setError(null);
    setErroresCampos(errores);
    if (Object.keys(errores).length > 0) return;
    setGuardando(true);
    try {
      if (editando) {
        await services.actualizarProcesion(procesionId, datosFormulario(await pasosParaGuardar()));
        recorridoSinGuardarRef.current = null; // ya es de la procesión
        navigation.replace('ProcesionActualizada', {
          nombreProcesion: nombre.trim(),
          ciudadId,
          procesionId,
          estadoNuevo: estado !== estadoOriginal ? estado : null,
        });
      } else {
        const procesionCreada = await services.crearProcesion(datosFormulario(null));
        recorridoSinGuardarRef.current = null; // ya es de la procesión
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
            await services.eliminarProcesion(procesionId);
            navigation.navigate('Procesiones', { ciudadId });
          } catch (err) {
            // Antes sin catch: un rechazo del backend no mostraba ningún aviso.
            Alert.alert('No se ha podido eliminar', err.message);
          } finally {
            setEliminando(false);
          }
        },
      },
    ]);
  }

  if (cargandoDatos) {
    return (
      <common.ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </common.ScreenContainer>
    );
  }

  return (
    <common.ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Nombre de la procesión</Text>
          <TextInput value={nombre} onChangeText={cambiarCampo(setNombre, 'nombre')} style={styles.input} />
          {erroresCampos.nombre ? <Text style={styles.errorCampo}>{erroresCampos.nombre}</Text> : null}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Cofradías</Text>
          <SelectorCofradias cofradias={cofradiasDisponibles} seleccionadas={cofradiasSeleccionadas} onCambiar={cambiarCofradias} />
          {erroresCampos.cofradia ? <Text style={styles.errorCampo}>{erroresCampos.cofradia}</Text> : null}
        </View>

        {editando ? (
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Estado</Text>
            <View style={styles.estadoRow}>
              {OPCIONES_ESTADO.map((opcion) => {
                const seleccionado = estado === opcion.valor;
                return (
                  <TouchableOpacity
                    key={opcion.valor}
                    style={[styles.estadoChip, { backgroundColor: opcion.background }, seleccionado && { borderColor: opcion.texto }]}
                    onPress={() => setEstado(opcion.valor)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.estadoChipTexto, { color: opcion.texto }]}>{opcion.etiqueta}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.ayudaEstado}>
              {estado === models.EstadoEvento.CANCELADO && estadoOriginal === models.EstadoEvento.CANCELADO
                ? 'Procesión cancelada. Elige "Programado" si vuelve a celebrarse.'
                : estado === models.EstadoEvento.CANCELADO
                  ? 'Al guardar podrás explicar a los ciudadanos el motivo.'
                  : estado !== estadoOriginal && estado !== models.EstadoEvento.PROGRAMADO
                    ? 'Al guardar se avisará automáticamente a los ciudadanos.'
                    : 'Cambia sola a "En curso" y "Finalizado" a la hora de salida y de fin.'}
            </Text>
          </View>
        ) : null}

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
              onChangeText={cambiarCampo(setHoraSalida, 'horaSalida')}
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
        {erroresCampos.dia ? <Text style={styles.errorCampoFila}>{erroresCampos.dia}</Text> : null}
        {erroresCampos.horaSalida ? <Text style={styles.errorCampoFila}>{erroresCampos.horaSalida}</Text> : null}

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
            procesión (pasoIds, ver SeleccionarPasosScreen), que se eligen
            entre los de TODAS sus cofradías participantes. Creando: todavía
            no hay procesión a la que asignar pasos, así que se indica cuántos
            hay entre las cofradías elegidas, a título informativo. */}
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
        ) : cofradiasSeleccionadas.length > 0 ? (
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>{cofradiasSeleccionadas.length > 1 ? 'Pasos de las cofradías' : 'Pasos de la cofradía'}</Text>
            <TouchableOpacity
              style={styles.pasosRow}
              onPress={() => navigation.navigate('Pasos', { ciudadId, cofradiaIdInicial: cofradiasSeleccionadas[0] })}
              activeOpacity={0.8}
            >
              <View>
                <Text style={styles.pasosTitulo}>Lista de pasos</Text>
                <Text style={styles.pasosMeta}>{numPasos} pasos (los eliges tras crear la procesión)</Text>
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
          disabled={guardando || eliminando}
        >
          {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.botonTexto}>{editando ? 'Guardar' : 'Crear'}</Text>}
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

      <Modal transparent visible={modalDiaVisible} animationType="fade" onRequestClose={() => setModalDiaVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalDiaVisible(false)}>
          <View style={styles.modalLista}>
            {diasSemanaSanta.map((dia) => (
              <TouchableOpacity
                key={dia.id}
                style={styles.modalItem}
                onPress={() => {
                  setDiaSeleccionado(dia);
                  limpiarError('dia');
                  setModalDiaVisible(false);
                }}
              >
                <Text style={styles.modalItemTexto}>{dia.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </common.ScreenContainer>
  );
}
