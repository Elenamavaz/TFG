import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRecorridoCompleto, marcarPuntoDeInteres, actualizarPuntoDeInteres } from '../../../../data/services';
import { TipoPuntoInteres, PuntoDeInteres } from '../../../../data/models';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { styles } from './EditarRecorridoScreen.styles';

// Etiquetas legibles del enum TipoPuntoInteres del backend -incluye
// "ORACCION" tal cual (con doble C): es un typo real del backend, ver
// enums.js del cliente, no se corrige aquí para no desincronizar el valor
// que se manda a la API.
const ETIQUETA_TIPO = {
  [TipoPuntoInteres.MONUMENTO]: 'Monumento',
  [TipoPuntoInteres.IGLESIA]: 'Iglesia',
  [TipoPuntoInteres.ENCUENTRO]: 'Encuentro',
  [TipoPuntoInteres.ORACCION]: 'Oración / lectura',
  [TipoPuntoInteres.ENTRADAPROCESION]: 'Entrada de la procesión',
  [TipoPuntoInteres.SALIDAPROCESION]: 'Salida de la procesión',
  [TipoPuntoInteres.UBICACIONEVENTO]: 'Ubicación de un evento',
};

// Pantalla a la que lleva "Editar recorrido" en FormularioProcesionScreen,
// visible en cuanto la procesión tiene un recorrido importado (2026-08-23,
// a petición de Elena): el GPX solo trae puntos de paso sueltos, sin
// significado -aquí se puede marcar cuáles de esos puntos son en realidad
// un encuentro, la entrada a una iglesia, una parada para una lectura u
// oración, etc., y darles nombre y descripción.
export function EditarRecorridoScreen({ route, navigation }) {
  const { recorridoId } = route.params;

  const [cargando, setCargando] = useState(true);
  const [puntos, setPuntos] = useState([]);
  const [puntoEditando, setPuntoEditando] = useState(null); // null = modal cerrado
  const [tipo, setTipo] = useState(null);
  const [modalTipoVisible, setModalTipoVisible] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerTintColor: colors.subtitle,
      headerTitleStyle: { color: colors.textPrimary },
      title: 'Editar recorrido',
    });
  }, [navigation]);

  useEffect(() => {
    getRecorridoCompleto(recorridoId).then((recorrido) => {
      setPuntos(recorrido.puntos);
      setCargando(false);
    });
  }, [recorridoId]);

  function abrirPunto(punto) {
    setPuntoEditando(punto);
    setTipo(punto.tipo);
    setNombre(punto.nombre ?? '');
    setDescripcion(punto.descripcion ?? '');
    setImagen(punto.imagen ?? '');
    setError(null);
  }

  function cerrarModal() {
    if (guardando) return;
    setPuntoEditando(null);
  }

  // Ya era un punto de interés (tiene tipo): se actualiza el mismo -PUT
  // /puntos-de-interes/{id}-. Era un punto de paso simple (tipo null): se
  // "convierte" en uno nuevo -PUT /recorridos/{id}/puntos-ruta/{relacionId}/
  // punto-de-interes, ver recorridoService.marcarPuntoDeInteres- y se
  // sustituye en la lista local por el que devuelve el backend (id nuevo).
  async function guardar() {
    if (guardando || !tipo || !nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      const datos = { tipo, nombre: nombre.trim(), descripcion: descripcion.trim() || null, imagen: imagen.trim() || null };
      const actualizado = puntoEditando.tipo
        ? await actualizarPuntoDeInteres(puntoEditando.id, { ...datos, ubicacionId: puntoEditando.ubicacionId })
        : await marcarPuntoDeInteres(recorridoId, puntoEditando.relacionId, datos);
      // actualizarPuntoDeInteres no sabe nada de la relación con el
      // recorrido (PUT /puntos-de-interes/{id} no la lleva) -se conserva la
      // del punto que ya teníamos abierto, es la misma en los dos casos.
      const puntoConRelacion = new PuntoDeInteres({
        ...actualizado,
        relacionId: puntoEditando.relacionId,
        orden: puntoEditando.orden,
        horaPrevista: puntoEditando.horaPrevista,
      });
      setPuntos((actuales) => actuales.map((p) => (p.relacionId === puntoConRelacion.relacionId ? puntoConRelacion : p)));
      setPuntoEditando(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <ScreenContainer style={styles.cargando}>
        <ActivityIndicator color={colors.gold} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.ayuda}>
          Toca un punto del recorrido para marcarlo como un encuentro, la entrada a una iglesia, una parada para una
          lectura u oración, u otro punto de interés.
        </Text>

        {puntos.map((punto, indice) => (
          <TouchableOpacity key={punto.relacionId} style={styles.fila} onPress={() => abrirPunto(punto)} activeOpacity={0.8}>
            <View style={styles.filaNumero}>
              <Text style={styles.filaNumeroTexto}>{indice + 1}</Text>
            </View>
            <View style={styles.filaTextos}>
              <Text style={styles.filaTitulo}>{punto.nombre ?? 'Punto de paso'}</Text>
              <Text style={styles.filaMeta}>{punto.tipo ? ETIQUETA_TIPO[punto.tipo] : 'Toca para marcar como punto de interés'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.subtitle} />
          </TouchableOpacity>
        ))}
        {puntos.length === 0 ? <Text style={styles.empty}>Este recorrido no tiene puntos todavía.</Text> : null}
      </ScrollView>

      <Modal transparent visible={puntoEditando !== null} animationType="fade" onRequestClose={cerrarModal}>
        <Pressable style={styles.overlay} onPress={cerrarModal}>
          <Pressable style={styles.modalPunto} onPress={() => {}}>
            <Text style={styles.modalTitulo}>Punto de interés</Text>

            <Text style={styles.etiqueta}>Tipo</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setModalTipoVisible(true)} activeOpacity={0.8}>
              <Text style={tipo ? styles.selectorTexto : styles.selectorPlaceholder}>
                {tipo ? ETIQUETA_TIPO[tipo] : 'Seleccionar tipo'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.subtitle} />
            </TouchableOpacity>

            <Text style={styles.etiqueta}>Nombre</Text>
            <TextInput value={nombre} onChangeText={setNombre} style={styles.input} />

            <Text style={styles.etiqueta}>Descripción</Text>
            <TextInput
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.inputMultilinea]}
              placeholder="Qué pasa exactamente aquí (ej. encuentro con la Cofradía de..., lectura de la Palabra...)"
              placeholderTextColor={colors.subtitle}
            />

            <Text style={styles.etiqueta}>Imagen</Text>
            <TextInput
              value={imagen}
              onChangeText={setImagen}
              placeholder="URL de la imagen (opcional)"
              placeholderTextColor={colors.subtitle}
              autoCapitalize="none"
              keyboardType="url"
              style={styles.input}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalAcciones}>
              <TouchableOpacity style={styles.volverButton} onPress={cerrarModal} disabled={guardando}>
                <Text style={styles.volverTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.guardarButton, (!tipo || !nombre.trim()) && styles.botonDeshabilitado]}
                onPress={guardar}
                disabled={guardando || !tipo || !nombre.trim()}
              >
                {guardando ? <ActivityIndicator color={colors.background} /> : <Text style={styles.guardarTexto}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={modalTipoVisible} animationType="fade" onRequestClose={() => setModalTipoVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setModalTipoVisible(false)}>
          <View style={styles.modalLista}>
            {Object.values(TipoPuntoInteres).map((valor) => (
              <TouchableOpacity
                key={valor}
                style={styles.modalItem}
                onPress={() => {
                  setTipo(valor);
                  setModalTipoVisible(false);
                }}
              >
                <Text style={styles.modalItemTexto}>{ETIQUETA_TIPO[valor]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScreenContainer>
  );
}
