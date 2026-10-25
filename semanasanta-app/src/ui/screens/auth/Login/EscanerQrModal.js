import { useEffect, useRef } from 'react';
import { Linking, Modal, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../../theme';
import { styles } from './EscanerQrModal.styles';

// Lector del QR del código de acceso (2026-10-25): la Junta lo muestra o lo
// imprime en la iglesia (CodigosAccesoScreen) y el cofrade lo escanea aquí.
// El QR solo contiene el texto del código, así que lo leído se trata igual
// que si se hubiera escrito a mano (onCodigo -> LoginScreen.entrar).
export function EscanerQrModal({ visible, onCodigo, onCerrar }) {
  const [permiso, pedirPermiso] = useCameraPermissions();
  // La cámara puede avisar varias veces del mismo QR en un instante: solo
  // cuenta la primera lectura de cada apertura.
  const leidoRef = useRef(false);

  useEffect(() => {
    if (!visible) return;
    leidoRef.current = false;
    if (permiso && !permiso.granted && permiso.canAskAgain) pedirPermiso();
  }, [visible, permiso?.granted]);

  function alLeer({ data }) {
    if (leidoRef.current || !data) return;
    leidoRef.current = true;
    onCodigo(data.trim().toUpperCase());
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onCerrar}>
      <View style={styles.contenedor}>
        {permiso?.granted ? (
          <CameraView
            style={styles.camara}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={alLeer}
          />
        ) : (
          <View style={styles.sinPermiso}>
            <Ionicons name="camera-outline" size={40} color={colors.subtitle} />
            <Text style={styles.sinPermisoTexto}>
              {permiso && !permiso.canAskAgain
                ? 'Has denegado el permiso de cámara. Actívalo en los ajustes del móvil, o escribe el código a mano.'
                : 'Necesitamos la cámara para leer el QR de tu cofradía. También puedes escribir el código a mano.'}
            </Text>
            {permiso && !permiso.canAskAgain ? (
              <TouchableOpacity style={styles.boton} onPress={() => Linking.openSettings()} activeOpacity={0.85}>
                <Text style={styles.botonTexto}>Abrir ajustes</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.boton} onPress={pedirPermiso} activeOpacity={0.85}>
                <Text style={styles.botonTexto}>Permitir cámara</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.pie}>
          <Text style={styles.instrucciones}>Apunta al QR que te ha mostrado la Junta de Cofradías</Text>
          <TouchableOpacity style={styles.cerrar} onPress={onCerrar} activeOpacity={0.85}>
            <Text style={styles.cerrarTexto}>Escribir el código a mano</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
