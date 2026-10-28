import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { tiempo } from '../../../utils';
import { styles } from './CodigosAccesoScreen.styles';

// "25 de marzo, 18:30" a partir del LocalDateTime del backend (hora de
// España, sin zona). Se trocea el texto en vez de pasar por new Date: el
// backend lo envía con hasta 9 decimales en los segundos
// ("2026-10-26T18:30:12.123456789"), y no todos los motores de JavaScript
// (Hermes, en el móvil) aceptan ese formato.
export function formatearFechaHora(fechaIso) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(fechaIso ?? '');
  if (!partes) return '';
  const [, , mes, dia, hora, minuto] = partes;
  return `${Number(dia)} de ${tiempo.MESES[Number(mes) - 1]}, ${hora}:${minuto}`;
}

// Ventana con el código de acceso como QR, el texto del código debajo (para
// quien no pueda escanear) y hasta cuándo vale. Compartida por
// CodigosAccesoScreen (los códigos de una cofradía) y CodigosQrScreen (los
// activos de toda la ciudad). codigo = null -> cerrada.
export function QrCodigoModal({ codigo, nombreCofradia, onCerrar }) {
  return (
    <Modal visible={codigo !== null} transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={styles.qrOverlay} onPress={onCerrar}>
        <Pressable style={styles.qrModal}>
          <Text style={styles.qrCofradia}>{nombreCofradia ?? ''}</Text>
          <Text style={styles.qrInstrucciones}>Escanéalo al iniciar sesión como cofrade</Text>
          {codigo ? (
            <View style={styles.qrFondo}>
              {/* Fondo blanco con margen: los lectores de QR necesitan contraste y un borde claro. */}
              <QRCode value={codigo.codigo} size={220} color="#000000" backgroundColor="#FFFFFF" />
            </View>
          ) : null}
          <Text style={styles.qrInstrucciones}>o escribe este código</Text>
          <Text style={styles.qrCodigo} selectable>
            {codigo?.codigo}
          </Text>
          <Text style={styles.qrCaducidad}>Válido hasta el {formatearFechaHora(codigo?.fechaExpiracion)}</Text>
          <TouchableOpacity style={styles.qrCerrar} onPress={onCerrar} activeOpacity={0.85}>
            <Text style={styles.qrCerrarTexto}>Cerrar</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
