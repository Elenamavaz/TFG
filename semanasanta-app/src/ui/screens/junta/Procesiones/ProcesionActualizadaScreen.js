import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../../components/common';
import { colors } from '../../../../theme';
import { cancelarProcesion } from '../../../../data/services';
import { EstadoEvento, TipoNotificacion } from '../../../../data/models';
import { NotificarModal } from '../NotificarModal';
import { styles } from './ProcesionActualizadaScreen.styles';

// Qué ha avisado ya el backend por su cuenta al guardar (ver
// NotificacionService.notificarCambioDeEstado): pasar a EN_CURSO/FINALIZADO
// genera la notificación INICIO/FIN sin que la Junta tenga que redactarla.
const AVISO_AUTOMATICO_POR_ESTADO = {
  EN_CURSO: 'Se ha avisado automáticamente a los ciudadanos de que la procesión ha comenzado.',
  FINALIZADO: 'Se ha avisado automáticamente a los ciudadanos de que la procesión ha finalizado.',
};

// Confirmación aparte de ProcesionCreadaScreen. Rediseñada con el mockup
// del 2026-09-30 (consejo recibido por Elena: que cualquier cambio pueda
// notificarse justo al actualizar): "Ok" + "Crear Notificación", que abre
// el mismo modal "Notificar" de la lista. Ya no lleva "Actualizar pasos":
// la "Lista de pasos" sigue a mano dentro del propio formulario de edición.
export function ProcesionActualizadaScreen({ route, navigation }) {
  const { ciudadId, procesionId, nombreProcesion, estadoNuevo } = route.params;
  // Recién marcado como "Cancelada" en el formulario: el backend lo ha
  // cancelado sin avisar (no tenía motivo ni prioridad), así que el modal
  // se abre solo, con la cancelación ya elegida.
  const recienCancelado = estadoNuevo === EstadoEvento.CANCELADO;
  const [notificando, setNotificando] = useState(recienCancelado);
  const [notificacionEnviada, setNotificacionEnviada] = useState(false);

  const volverALista = () => navigation.navigate('Procesiones', { ciudadId });
  const avisoAutomatico = AVISO_AUTOMATICO_POR_ESTADO[estadoNuevo];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.check}>
        <Ionicons name="checkmark" size={40} color={colors.gold} />
      </View>
      <Text style={styles.title}>Procesion{'\n'}Actualizada</Text>
      <Text style={styles.subtitle}>La procesión se ha actualizado correctamente</Text>
      {avisoAutomatico ? <Text style={styles.avisoAutomatico}>{avisoAutomatico}</Text> : null}
      {recienCancelado && !notificacionEnviada ? (
        <Text style={styles.avisoCancelacion}>
          La procesión ha quedado cancelada. Usa "Crear Notificación" para explicar el motivo a los ciudadanos.
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
        elemento={notificando ? { id: procesionId, nombre: nombreProcesion } : null}
        ciudadId={ciudadId}
        etiquetaCancelar="Cancelar la procesión"
        tipoInicial={recienCancelado ? TipoNotificacion.CANCELACION : null}
        cancelar={cancelarProcesion}
        onCerrar={() => setNotificando(false)}
        onEnviada={() => {
          setNotificando(false);
          setNotificacionEnviada(true);
        }}
      />
    </ScreenContainer>
  );
}
