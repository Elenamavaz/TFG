import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { services } from '../../../data';
import { models } from '../../../data';
import { colors } from '../../../theme';
import { styles } from './NotificarModal.styles';

// Mismo criterio de color que Notificacion.colorCategoria (ver HomeScreen):
// ALTA grave, MEDIA a medias, BAJA informativo. Sin URGENTE desde el
// 2026-08-22 (ver Prioridad.java) -con estas tres queda completo.
const OPCIONES_PRIORIDAD = [
  { valor: models.Prioridad.BAJA, etiqueta: 'Baja', background: colors.greenBackground, texto: colors.lightGreenText },
  { valor: models.Prioridad.MEDIA, etiqueta: 'Media', background: colors.backgroundOrange, texto: colors.orangeText },
  { valor: models.Prioridad.ALTA, etiqueta: 'Alta', background: colors.backgroundRed, texto: colors.redText },
];

// CANCELACION es distinta del resto por dentro -además de la Notificacion,
// cambia el estado (ver ProcesionService/EventoService.cancelar, que llega
// por la prop "cancelar"). INICIO/FIN no aparecen aquí -los genera el
// sistema al cambiar el estado, no la Junta a mano (ver
// NotificacionService.crear, que los rechaza). ACTUALIZACION (2026-09-30)
// es el aviso genérico del mockup (p.ej. "actualización de la historia").
function opcionesTipo(etiquetaCancelar) {
  return [
    { valor: models.TipoNotificacion.ACTUALIZACION, etiqueta: 'Actualización de información' },
    { valor: models.TipoNotificacion.CAMBIO_HORARIO, etiqueta: 'Cambio de horario' },
    { valor: models.TipoNotificacion.INCIDENCIA, etiqueta: 'Incidencia' },
    { valor: models.TipoNotificacion.CANCELACION, etiqueta: etiquetaCancelar },
  ];
}

// Modal "Notificar" de la Junta (mockup "Procesión Actualizada" del
// 2026-09-30), compartido por ProcesionActualizadaScreen y
// EventoActualizadoScreen (2026-10-02) -ya no hay acción "Notificar" en
// ninguna lista. elemento = { id, nombre } de la procesión/evento, null ->
// modal cerrado. cancelar = cancelarProcesion/cancelarEvento. onEnviada
// recibe el tipo enviado (solo CANCELACION cambia además el estado).
// tipoInicial (opcional): tipo ya elegido al abrir -p.ej. CANCELACION cuando
// se acaba de marcar "Cancelada" en el formulario.
export function NotificarModal({ elemento, ciudadId, etiquetaCancelar, cancelar, tipoInicial = null, onCerrar, onEnviada }) {
  const OPCIONES_TIPO = opcionesTipo(etiquetaCancelar);
  const [tipo, setTipo] = useState(null);
  const [desplegableTipoAbierto, setDesplegableTipoAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [prioridad, setPrioridad] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);

  // Cada apertura empieza limpia, aunque se abra para el mismo elemento.
  useEffect(() => {
    if (!elemento) return;
    setTipo(tipoInicial);
    setDesplegableTipoAbierto(false);
    setMensaje('');
    setPrioridad(null);
    setError(null);
  }, [elemento, tipoInicial]);

  function cerrar() {
    if (enviando) return; // no cerrar a medio guardar
    onCerrar();
  }

  async function enviar() {
    if (!tipo || !prioridad || enviando) return;
    const mensajeLimpio = mensaje.trim();
    setEnviando(true);
    setError(null);
    try {
      if (tipo === models.TipoNotificacion.CANCELACION) {
        await cancelar(elemento.id, { mensaje: mensajeLimpio, prioridad });
      } else {
        await services.crearNotificacion({
          // Solo el nombre: "qué ha pasado" ya lo dice el tipo (2026-10-03,
          // ver Notificacion.etiquetaTipo y la tarjeta de HomeScreen).
          titulo: elemento.nombre,
          mensaje: mensajeLimpio,
          ciudadId,
          tipo,
          prioridad,
        });
      }
      onEnviada(tipo);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const opcionTipo = OPCIONES_TIPO.find((o) => o.valor === tipo);

  return (
    <Modal transparent visible={elemento !== null} animationType="fade" onRequestClose={cerrar}>
      <Pressable style={styles.overlay} onPress={cerrar}>
        <Pressable style={styles.modal} onPress={() => {}}>
          <Text style={styles.titulo}>Notificar</Text>
          <Text style={styles.subtitulo}>
            {elemento
              ? `Este aviso será visible para los ciudadanos e informará de los cambios en "${elemento.nombre}".`
              : ''}
          </Text>

          <Text style={styles.etiqueta}>Tipo</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setDesplegableTipoAbierto((abierto) => !abierto)}
            activeOpacity={0.8}
          >
            <Text style={opcionTipo ? styles.selectorTexto : styles.selectorPlaceholder}>
              {opcionTipo ? opcionTipo.etiqueta : 'Seleccionar tipo'}
            </Text>
            <Ionicons name={desplegableTipoAbierto ? 'chevron-up' : 'chevron-down'} size={16} color={colors.subtitle} />
          </TouchableOpacity>
          {desplegableTipoAbierto ? (
            <View style={styles.desplegable}>
              {OPCIONES_TIPO.map((opcion) => (
                <TouchableOpacity
                  key={opcion.valor}
                  style={styles.desplegableItem}
                  onPress={() => {
                    setTipo(opcion.valor);
                    setDesplegableTipoAbierto(false);
                  }}
                >
                  <Text style={[styles.desplegableTexto, tipo === opcion.valor && { color: colors.gold }]}>
                    {opcion.etiqueta}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={styles.etiqueta}>Motivos</Text>
          <TextInput
            style={[styles.input, styles.inputMultilinea]}
            value={mensaje}
            onChangeText={setMensaje}
            placeholder="Ej. cancelación de la procesión por lluvias"
            placeholderTextColor={colors.subtitle}
            multiline
          />

          <Text style={styles.etiqueta}>Prioridad</Text>
          <View style={styles.prioridadRow}>
            {OPCIONES_PRIORIDAD.map((opcion) => {
              const seleccionada = prioridad === opcion.valor;
              return (
                <TouchableOpacity
                  key={opcion.valor}
                  style={[styles.prioridadChip, { backgroundColor: opcion.background }, seleccionada && { borderColor: opcion.texto }]}
                  onPress={() => setPrioridad(opcion.valor)}
                >
                  <Text style={[styles.prioridadChipTexto, { color: opcion.texto }]}>{opcion.etiqueta}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.acciones}>
            <TouchableOpacity style={styles.cancelarButton} onPress={cerrar} disabled={enviando}>
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.enviarButton, (!tipo || !prioridad || enviando) && styles.botonDeshabilitado]}
              onPress={enviar}
              disabled={!tipo || !prioridad || enviando}
            >
              <Text style={styles.enviarTexto}>Enviar notificaciones</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
