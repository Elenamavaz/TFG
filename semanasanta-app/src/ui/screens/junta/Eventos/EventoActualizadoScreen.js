import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { cancelarEvento } from '../../../../data/services';
import { EstadoEvento, TipoNotificacion } from '../../../../data/models';
import { NotificarModal } from '../NotificarModal';
import { styles } from './EventoActualizadoScreen.styles';

// Qué ha avisado ya el backend por su cuenta al guardar (ver
// NotificacionService.notificarCambioDeEstado): pasar a EN_CURSO/FINALIZADO
// genera la notificación INICIO/FIN sin que la Junta tenga que redactarla.
const AVISO_AUTOMATICO_POR_ESTADO = {
  EN_CURSO: 'Se ha avisado automáticamente a los ciudadanos de que el evento ha comenzado.',
  FINALIZADO: 'Se ha avisado automáticamente a los ciudadanos de que el evento ha finalizado.',
};

// Mismo cambio que ProcesionActualizadaScreen (2026-10-02, a petición de
// Elena): "Ok" + "Crear Notificación" con el modal "Notificar", en vez de
// "Actualizar pasos"/"Hacerlo más tarde" -la "Lista de pasos" sigue dentro
// del propio formulario de edición. Ya no comparte estilos con
// EventoCreadoScreen (esa sigue con su diseño de siempre).
export function EventoActualizadoScreen({ route, navigation }) {
  const { ciudadId, eventoId, nombreEvento, estadoNuevo } = route.params;
  // Recién marcado como "Cancelado" en el formulario: el backend lo ha
  // cancelado sin avisar (no tenía motivo ni prioridad), así que el modal
  // se abre solo, con la cancelación ya elegida.
  const recienCancelado = estadoNuevo === EstadoEvento.CANCELADO;
  const [notificando, setNotificando] = useState(recienCancelado);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);

  const volverALista = () => navigation.navigate('Eventos', { ciudadId });
  const avisoAutomatico = AVISO_AUTOMATICO_POR_ESTADO[estadoNuevo];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Evento{'\n'}Actualizado</Text>
      <Text style={styles.subtitle}>El evento se ha actualizado correctamente</Text>
      {avisoAutomatico ? <Text style={styles.avisoAutomatico}>{avisoAutomatico}</Text> : null}
      {recienCancelado && !notificacionEnviada ? (
        <Text style={styles.avisoCancelacion}>
          El evento ha quedado cancelado. Usa "Crear Notificación" para explicar el motivo a los ciudadanos.
        </Text>
      ) : null}

      <TouchableOpacity style={styles.boton} onPress={volverALista} activeOpacity={0.85}>
        <Text style={styles.botonTexto}>Ok</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.notificarButton, notificacionEnviada && styles.botonDeshabilitado]}
        onPress={() => setNotificando(true)}
        activeOpacity={0.85}
        disabled={notificacionEnviada}
      >
        <Text style={styles.notificarTexto}>{notificacionEnviada ? 'Notificación enviada' : 'Crear Notificacion'}</Text>
      </TouchableOpacity>
      <Text style={styles.ayuda}>En caso de querer notificar a los usuarios sobre las modificaciones realizadas</Text>

      <NotificarModal
        elemento={notificando ? { id: eventoId, nombre: nombreEvento } : null}
        ciudadId={ciudadId}
        etiquetaCancelar="Cancelar el evento"
        tipoInicial={recienCancelado ? TipoNotificacion.CANCELACION : null}
        cancelar={cancelarEvento}
        onCerrar={() => setNotificando(false)}
        onEnviada={() => {
          setNotificando(false);
          setNotificacionEnviada(true);
        }}
      />
    </ScreenContainer>
  );
}
