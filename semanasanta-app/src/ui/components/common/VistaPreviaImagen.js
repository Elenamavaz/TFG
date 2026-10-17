import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

export const ESTADO_IMAGEN = { VACIA: 'vacia', CARGANDO: 'cargando', OK: 'ok', ERROR: 'error' };

const URL_IMAGEN = /^https?:\/\/\S+$/;

// Debajo del campo "Imagen" de los formularios de la Junta: carga el enlace
// tal cual lo verá el ciudadano y dice si funciona. Hasta ahora no había
// forma de saberlo al guardar, y un enlace que no es una imagen (la página
// de Google Imágenes, un enlace de Drive o Instagram...) no se veía en
// ninguna parte. onEstado avisa al formulario para que pueda impedir guardar
// un enlace que no carga.
export function VistaPreviaImagen({ url, onEstado }) {
  const limpia = (url ?? '').trim();
  const formatoValido = URL_IMAGEN.test(limpia);
  const [estado, setEstado] = useState(ESTADO_IMAGEN.VACIA);

  useEffect(() => {
    const inicial = !limpia ? ESTADO_IMAGEN.VACIA : formatoValido ? ESTADO_IMAGEN.CARGANDO : ESTADO_IMAGEN.ERROR;
    setEstado(inicial);
  }, [limpia, formatoValido]);

  useEffect(() => {
    onEstado?.(estado);
  }, [estado]);

  if (estado === ESTADO_IMAGEN.VACIA) return null;

  return (
    <View style={styles.fila}>
      {formatoValido ? (
        <Image
          source={{ uri: limpia }}
          style={styles.miniatura}
          resizeMode="cover"
          onLoad={() => setEstado(ESTADO_IMAGEN.OK)}
          onError={() => setEstado(ESTADO_IMAGEN.ERROR)}
        />
      ) : (
        <View style={styles.miniatura} />
      )}
      <View style={styles.texto}>
        {estado === ESTADO_IMAGEN.CARGANDO ? (
          <View style={styles.estadoFila}>
            <ActivityIndicator size="small" color={colors.gold} />
            <Text style={styles.estadoTexto}>Comprobando la imagen…</Text>
          </View>
        ) : estado === ESTADO_IMAGEN.OK ? (
          <View style={styles.estadoFila}>
            <Ionicons name="checkmark-circle" size={14} color={colors.lightGreenText} />
            <Text style={[styles.estadoTexto, { color: colors.lightGreenText }]}>Así la verán los ciudadanos</Text>
          </View>
        ) : (
          <View style={styles.estadoFila}>
            <Ionicons name="alert-circle" size={14} color={colors.redText} />
            <Text style={[styles.estadoTexto, { color: colors.redText }]}>
              {formatoValido
                ? 'No se puede cargar. Usa el enlace directo a la imagen (en el navegador: mantén pulsada la imagen → "Copiar dirección de la imagen").'
                : 'El enlace debe empezar por http:// o https://'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  miniatura: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  texto: {
    flex: 1,
  },
  estadoFila: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  estadoTexto: {
    flex: 1,
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 11,
    lineHeight: 15,
  },
});
