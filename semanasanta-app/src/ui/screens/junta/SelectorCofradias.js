import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { services } from '../../../data';
import { colors, fontFamilies, radii, spacing } from '../../../theme';

// Selector de las cofradías que participan en una procesión o un evento,
// compartido por FormularioProcesionScreen y FormularioEventoScreen (bug 37
// de bugs.md, 2026-10-21). Antes se elegía UNA sola cofradía y al editar se
// mandaba solo esa, así que guardar la Procesión General (20 cofradías), el
// Rosario del Dolor (6) o los Encuentros (2) borraba el resto.
//
// seleccionadas: ids, en el orden en que se eligieron (la primera es la que
// se usa para "Ver lista de pasos" mientras se crea).
export function SelectorCofradias({ cofradias, seleccionadas, onCambiar }) {
  const [abierto, setAbierto] = useState(false);
  const elegidas = seleccionadas.map((id) => cofradias.find((c) => c.id === id)).filter(Boolean);
  const todas = cofradias.length > 0 && elegidas.length === cofradias.length;

  const resumen =
    elegidas.length === 0
      ? null
      : todas && cofradias.length > 1
        ? `Todas las cofradías (${cofradias.length})`
        : elegidas.length === 1
          ? elegidas[0].nombre
          : `${elegidas[0].nombre} y ${elegidas.length - 1} más`;

  function alternar(id) {
    onCambiar(seleccionadas.includes(id) ? seleccionadas.filter((x) => x !== id) : [...seleccionadas, id]);
  }

  return (
    <>
      <TouchableOpacity style={styles.selector} onPress={() => setAbierto(true)} activeOpacity={0.8}>
        <Text style={resumen ? styles.selectorTexto : styles.selectorPlaceholder} numberOfLines={2}>
          {resumen ?? 'Seleccionar una o varias'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.subtitle} />
      </TouchableOpacity>
      {elegidas.length > 1 && !todas ? (
        <Text style={styles.detalle} numberOfLines={3}>
          {elegidas.map((c) => c.nombre).join(' · ')}
        </Text>
      ) : null}

      <Modal transparent visible={abierto} animationType="fade" onRequestClose={() => setAbierto(false)}>
        <Pressable style={styles.overlay} onPress={() => setAbierto(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <Text style={styles.titulo}>Cofradías que participan</Text>
            {cofradias.length === 0 ? (
              <Text style={styles.vacio}>No hay cofradías todavía en esta ciudad.</Text>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.todas}
                  onPress={() => onCambiar(todas ? [] : cofradias.map((c) => c.id))}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.todasTexto}>{todas ? 'Quitar todas' : 'Seleccionar todas'}</Text>
                </TouchableOpacity>
                <ScrollView style={styles.lista}>
                  {cofradias.map((cofradia) => {
                    const marcada = seleccionadas.includes(cofradia.id);
                    return (
                      <TouchableOpacity key={cofradia.id} style={styles.fila} onPress={() => alternar(cofradia.id)} activeOpacity={0.8}>
                        <Ionicons
                          name={marcada ? 'checkbox' : 'square-outline'}
                          size={22}
                          color={marcada ? colors.gold : colors.subtitle}
                        />
                        <Text style={styles.filaTexto}>{cofradia.nombre}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}
            <TouchableOpacity style={styles.listo} onPress={() => setAbierto(false)} activeOpacity={0.85}>
              <Text style={styles.listoTexto}>Listo</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

// Número de pasos entre los que se podrá elegir: los de TODAS las cofradías
// participantes (un paso pertenece a una sola cofradía, RF-30).
export async function contarPasosDeCofradias(cofradiaIds) {
  const listas = await Promise.all(cofradiaIds.map((id) => services.getPasosPorCofradia(id)));
  return listas.reduce((total, lista) => total + lista.length, 0);
}

// Al quitar una cofradía de una procesión/evento ya creado, sus pasos dejan
// de poder estar en él (solo se ofrecen los de las cofradías participantes):
// devuelve los pasoIds actuales que siguen perteneciendo a alguna de las
// cofradías elegidas.
export async function pasosQueSiguenValiendo(pasoIds, cofradiaIds) {
  const listas = await Promise.all(cofradiaIds.map((id) => services.getPasosPorCofradia(id)));
  const validos = new Set(listas.flat().map((paso) => paso.id));
  return pasoIds.filter((id) => validos.has(id));
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    backgroundColor: colors.backgroundAlt,
    borderRadius: radii.md,
    borderWidth: 0.5,
    borderColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  selectorTexto: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },
  selectorPlaceholder: {
    flex: 1,
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 14,
  },
  detalle: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 11,
    lineHeight: 15,
    marginTop: spacing.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 0.5,
    borderRadius: radii.md,
    borderColor: colors.subtitle,
    padding: spacing.md,
    width: '100%',
    maxWidth: 360,
    maxHeight: '85%',
  },
  titulo: {
    color: colors.textPrimary,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  todas: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
  },
  todasTexto: {
    color: colors.gold,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 13,
  },
  lista: {
    flexGrow: 0,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  filaTexto: {
    flex: 1,
    color: colors.cream,
    fontFamily: fontFamilies.uiMedium,
    fontSize: 14,
  },
  vacio: {
    color: colors.subtitle,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  listo: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: radii.lg,
    paddingVertical: spacing.sm,
    marginTop: spacing.md,
  },
  listoTexto: {
    color: colors.background,
    fontFamily: fontFamilies.titleSemiBold,
    fontSize: 15,
  },
});
