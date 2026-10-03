import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  getCofradiasGestion,
  getDiasSemanaSanta,
  getEventoPorId,
  getUbicacionPorId,
  crearUbicacion,
  actualizarUbicacion,
  getPasosPorCofradia,
  crearEvento,
  actualizarEvento,
  eliminarEvento,
} from '../../../../data/services';
import { EstadoEvento } from '../../../../data/models';
import { combinarFechaHora, sumarMinutos, formatearDuracionCorta, parsearDuracionCorta } from '../../../../data/utils/fechaSemanaSanta';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './FormularioEventoScreen.styles';

// Formulario compartido entre "Nuevo evento" y "Editar evento" (mockup del
// 2026-08-22), mismo patrón que FormularioProcesionScreen para Cofradia y
// Día/Inicio. Tres diferencias respecto al mockup, todas a petición de
// Elena o ya decididas antes en el propio código:
// - "Duración" (2026-09-30, antes no existía: el backend solo guardaba
//   `fecha`): se convierte en fechaFin igual que en FormularioProcesionScreen.
//   Con ella el evento pasa solo a "En curso"/"Finalizado" al llegar la hora
//   (CambioEstadoAutomaticoService del backend).
// - "Ubicación" pide dirección + latitud/longitud sueltas, no solo la
//   dirección como en el mockup: no hay geocodificación (texto -> coordenadas)
//   en el proyecto, y Ubicacion exige lat/lon obligatorias.
// - "Lista de pasos" no es un campo del formulario, es un enlace informativo
//   a PasosScreen filtrado por esta cofradía (cuenta los pasos con
//   getPasosPorCofradia).
// Estado (2026-10-02, mismo cambio que FormularioProcesionScreen): cambia
// solo a "En curso"/"Finalizado" al llegar la hora de inicio/fin
// (CambioEstadoAutomaticoService del backend); este selector es la
// corrección manual (empezar o terminar antes, reprogramar uno cancelado).
// Pasar a "En curso"/"Finalizado" avisa solo a los ciudadanos (INICIO/FIN).
// "Cancelado" cancela sin avisar: al guardar se abre "Crear Notificación"
// con la cancelación ya elegida, para dar motivo y prioridad.
const OPCIONES_ESTADO = [
  { valor: EstadoEvento.PROGRAMADO, etiqueta: 'Programado', background: colors.backgroundOrange, texto: colors.orangeText },
  { valor: EstadoEvento.EN_CURSO, etiqueta: 'En curso', background: colors.greenBackground, texto: colors.lightGreenText },
  { valor: EstadoEvento.FINALIZADO, etiqueta: 'Finalizado', background: colors.backgroundRed, texto: colors.redText },
  { valor: EstadoEvento.CANCELADO, etiqueta: 'Cancelado', background: colors.backgroundRed, texto: colors.redText },
];

export function FormularioEventoScreen({ route, navigation }) {
  const { ciudadId } = route.params;
  const eventoId = route.params?.eventoId ?? null;
  const editando = eventoId !== null;

  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [nombre, setNombre] = useState('');
  const [cofradiasDisponibles, setCofradiasDisponibles] = useState([]);
  const [cofradiaSeleccionada, setCofradiaSeleccionada] = useState(null);
  const [modalCofradiaVisible, setModalCofradiaVisible] = useState(false);
  const [numPasos, setNumPasos] = useState(0); // candidatos: pasos de la cofradía elegida (solo mientras se crea, ver JSX)
  const [numPasosAsignados, setNumPasosAsignados] = useState(0); // los que YA participan en este evento (editando)
  const [diasSemanaSanta, setDiasSemanaSanta] = useState([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [modalDiaVisible, setModalDiaVisible] = useState(false);
  const [horaInicio, setHoraInicio] = useState('');
  const [duracionTexto, setDuracionTexto] = useState('0h 0min');
  const [estado, setEstado] = useState(EstadoEvento.PROGRAMADO);
  const [estadoOriginal, setEstadoOriginal] = useState(EstadoEvento.PROGRAMADO);
  const [webOficial, setWebOficial] = useState('');
  const [historia, setHistoria] = useState('');
  const [ubicacionId, setUbicacionId] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
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
      title: editando ? 'Editar evento' : 'Nuevo evento',
    });
  }, [navigation, editando]);

  useEffect(() => {
    Promise.all([
      getCofradiasGestion(ciudadId),
      getDiasSemanaSanta(),
      editando ? getEventoPorId(eventoId) : Promise.resolve(null),
    ]).then(async ([cofradias, dias, evento]) => {
      setCofradiasDisponibles(cofradias);
      setDiasSemanaSanta(dias);

      if (evento) {
        const cofradia = cofradias.find((c) => evento.cofradiaIds.includes(c.id)) ?? null;
        setNombre(evento.nombre);
        setCofradiaSeleccionada(cofradia);
        setDiaSeleccionado(dias.find((d) => d.nombre === evento.dia) ?? null);
        setHoraInicio(evento.hora ?? '');
        setDuracionTexto(formatearDuracionCorta(evento.duracionMin ?? 0));
        setEstado(evento.estado);
        setEstadoOriginal(evento.estado);
        setWebOficial(evento.web ?? '');
        setHistoria(evento.historia ?? '');
        if (cofradia) {
          getPasosPorCofradia(cofradia.id).then((pasos) => setNumPasos(pasos.length));
        }
        setNumPasosAsignados(evento.pasoIds.length);
        if (evento.ubicacionId) {
          const ubicacion = await getUbicacionPorId(evento.ubicacionId);
          setUbicacionId(ubicacion.id);
          setDireccion(ubicacion.direccion ?? '');
          setLatitud(ubicacion.latitud != null ? String(ubicacion.latitud) : '');
          setLongitud(ubicacion.longitud != null ? String(ubicacion.longitud) : '');
        }
      }
      setCargandoDatos(false);
    });
  }, [ciudadId, eventoId, editando]);

  function seleccionarCofradia(cofradia) {
    setCofradiaSeleccionada(cofradia);
    setModalCofradiaVisible(false);
    getPasosPorCofradia(cofradia.id).then((pasos) => setNumPasos(pasos.length));
  }

  const latitudNumero = Number(latitud.replace(',', '.'));
  const longitudNumero = Number(longitud.replace(',', '.'));
  const ubicacionValida = latitud.trim() !== '' && longitud.trim() !== '' && !Number.isNaN(latitudNumero) && !Number.isNaN(longitudNumero);

  async function resolverUbicacionId() {
    const datosUbicacion = { latitud: latitudNumero, longitud: longitudNumero, direccion: direccion.trim() || null };
    if (ubicacionId) {
      const actualizada = await actualizarUbicacion(ubicacionId, datosUbicacion);
      return actualizada.id;
    }
    const creada = await crearUbicacion(datosUbicacion);
    return creada.id;
  }

  async function guardar() {
    if (guardando || !ubicacionValida) return;
    setError(null);
    setErroresCampos({});
    setGuardando(true);
    try {
      const idUbicacion = await resolverUbicacionId();
      const fecha = combinarFechaHora(diaSeleccionado?.fecha, horaInicio);
      const duracionMin = parsearDuracionCorta(duracionTexto);
      const datos = {
        nombre: nombre.trim(),
        historia: historia.trim() || null,
        tradicion: null,
        fecha,
        // Duración 0 -> null (ver sumarMinutos): sin hora de fin, el evento
        // no se finaliza solo, solo a mano.
        fechaFin: sumarMinutos(fecha, duracionMin),
        cofradiaIds: cofradiaSeleccionada ? [cofradiaSeleccionada.id] : [],
        ubicacionId: idUbicacion,
        web: webOficial.trim() || null,
        // Los pasos se asignan aparte, en SeleccionarPasosEventoScreen
        // (2026-08-23) -mismo patrón que FormularioProcesionScreen, que
        // tampoco los toca aquí.
        pasosIds: null,
        estado: editando ? estado : null, // al crear, el backend lo deja PROGRAMADO
      };
      if (editando) {
        await actualizarEvento(eventoId, datos);
        navigation.replace('EventoActualizado', {
          nombreEvento: nombre.trim(),
          ciudadId,
          eventoId,
          estadoNuevo: estado !== estadoOriginal ? estado : null,
        });
      } else {
        const eventoCreado = await crearEvento(datos);
        navigation.replace('EventoCreado', { nombreEvento: eventoCreado.nombre, ciudadId, eventoId: eventoCreado.id });
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
    Alert.alert('Eliminar evento', `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarEvento(eventoId);
            navigation.navigate('Eventos', { ciudadId });
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
          <Text style={styles.etiqueta}>Nombre del evento</Text>
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
              {estado === EstadoEvento.CANCELADO && estadoOriginal === EstadoEvento.CANCELADO
                ? 'Evento cancelado. Elige "Programado" si vuelve a celebrarse.'
                : estado === EstadoEvento.CANCELADO
                  ? 'Al guardar podrás explicar a los ciudadanos el motivo.'
                  : estado !== estadoOriginal && estado !== EstadoEvento.PROGRAMADO
                    ? 'Al guardar se avisará automáticamente a los ciudadanos.'
                    : 'Cambia solo a "En curso" y "Finalizado" a la hora de inicio y de fin.'}
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
              <Text style={styles.etiquetaCompactaTexto}>Inicio</Text>
            </View>
            <TextInput
              value={horaInicio}
              onChangeText={setHoraInicio}
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
          <Text style={styles.etiqueta}>Ubicación</Text>
          <TextInput
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección (calle, plaza...)"
            placeholderTextColor={colors.subtitle}
            style={styles.input}
          />
          <View style={styles.filaCompacta}>
            <View style={styles.campoCompacto}>
              <Text style={styles.etiquetaCompactaTexto}>Latitud</Text>
              <TextInput
                value={latitud}
                onChangeText={setLatitud}
                placeholder="37.1880"
                placeholderTextColor={colors.subtitle}
                keyboardType="numbers-and-punctuation"
                style={styles.inputCompacto}
              />
            </View>
            <View style={styles.campoCompacto}>
              <Text style={styles.etiquetaCompactaTexto}>Longitud</Text>
              <TextInput
                value={longitud}
                onChangeText={setLongitud}
                placeholder="-3.6080"
                placeholderTextColor={colors.subtitle}
                keyboardType="numbers-and-punctuation"
                style={styles.inputCompacto}
              />
            </View>
          </View>
          <Text style={styles.ayuda}>Coordenadas del sitio (sin geocodificación automática todavía).</Text>
        </View>

        {/* Editando: "Lista de pasos" muestra los que YA participan en ESTE
            evento (pasoIds, ver SeleccionarPasosEventoScreen) -no los de una
            sola cofradía. Un evento puede tener varias cofradías
            (cofradiaIds), y esa pantalla ya reúne los pasos de TODAS ellas,
            no solo de la que se ve seleccionada aquí (el selector de este
            formulario solo deja elegir una, mismo caso que Procesion).
            Creando: todavía no hay evento al que asignar pasos, así que se
            muestran los de la cofradía elegida como candidatos. */}
        {editando ? (
          <View style={styles.campo}>
            <Text style={styles.etiqueta}>Elementos del Evento</Text>
            <TouchableOpacity
              style={styles.pasosRow}
              onPress={() => navigation.navigate('SeleccionarPasosEvento', { eventoId, ciudadId })}
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
          disabled={guardando || eliminando || !nombre.trim() || !cofradiaSeleccionada || !ubicacionValida}
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
