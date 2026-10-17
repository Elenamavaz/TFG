import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

// Sin conexión o error al cargar (bug 27 de bugs.md, 2026-10-17): en vez de
// un spinner infinito o una pantalla en blanco, el motivo y "Reintentar".
// pantallaCompleta = centrado en toda la pantalla (arranque, detalles);
// si no, una tarjeta dentro de una lista.
export function AvisoError({ mensaje, onReintentar, pantallaCompleta = false }) {
  return (
    <View style={pantallaCompleta ? styles.pantalla : styles.tarjeta}>
      <Ionicons name="cloud-offline-outline" size={pantallaCompleta ? 40 : 22} color={colors.subtitle} />
      <Text style={[styles.mensaje, pantallaCompleta && styles.mensajeGrande]}>
        {mensaje ?? 'No se ha podido cargar la información.'}
      </Text>
      {onReintentar ? (
        <TouchableOpacity style={styles.boton} onPress={onReintentar} activeOpacity={0.85}>
          <Ionicons name="refresh" size={16} color={colors.background} />
          <Text style={styles.botonTexto}>Reintentar</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// Mientras llega el primer dato de una pantalla de detalle (antes devolvían
// null: pantalla en negro sin saber si estaba cargando o había fallado).
export function PantallaCargando() {
  return (
    <View style={styles.pantalla}>
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  tarjeta: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  mensaje: {
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  mensajeGrande: {
    fontSize: 15,
    lineHeight: 21,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  botonTexto: {
    color: colors.background,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 14,
  },
});
