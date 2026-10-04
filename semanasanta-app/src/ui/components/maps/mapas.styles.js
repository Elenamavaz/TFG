import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import { fontFamilies } from '../../../theme';
import { radii } from '../../../theme';
import { spacing } from '../../../theme';

// Mapas pequeños de las pantallas de detalle (MapaRecorrido, MapaUbicacion).
export const styles = StyleSheet.create({
  tarjeta: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.subtitle,
    overflow: 'hidden',
    backgroundColor: colors.backgroundAlt,
  },
  // Alto del mapa pequeño. El MapView recibe ancho y alto exactos en
  // píxeles (el ancho, medido con onLayout), no flex ni posición absoluta:
  // en la nueva arquitectura de React Native el mapa nativo calculaba mal su
  // tamaño -o se quedaba sin él, o más alto de lo visible y con la cámara
  // descentrada- (2026-10-04).
  mapa: {
    height: 220,
  },
  pildoraEnCurso: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.greenBackground,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  pildoraTexto: {
    color: colors.cream,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
  },
  puntoVerde: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightGreenText,
  },
  puntoCabeza: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.lightGreenText,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  // Inicio y fin del recorrido (ver MarcadoresInicioFin).
  marcadorInicio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  marcadorFin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.gold,
  },
  marcadorEstrella: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avisoWeb: {
    borderRadius: radii.lg,
    borderWidth: 0.5,
    borderColor: colors.subtitle,
    backgroundColor: colors.backgroundAlt,
    padding: spacing.md,
  },
  avisoWebTexto: {
    color: colors.subtitle,
    fontFamily: fontFamilies.uiRegular,
    fontSize: 13,
    textAlign: 'center',
  },
});
