import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { context } from '../../../application';
import { colors } from '../../../theme';

// Corazón de la cabecera de las pantallas de detalle (procesión, evento,
// cofradía, paso). Antes era solo un icono, no marcaba nada (bug 16). Lee
// el FavoritosContext él mismo: así se redibuja al pulsarlo sin que la
// pantalla tenga que volver a llamar a navigation.setOptions.
export function FavoritoCabecera({ id, tipo }) {
  const { esFavorito, alternarFavorito } = context.useFavoritos();
  const marcado = esFavorito(id, tipo);
  return (
    <TouchableOpacity
      onPress={() => alternarFavorito(id, tipo)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={marcado ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <Ionicons name={marcado ? 'heart' : 'heart-outline'} size={22} color={marcado ? colors.gold : colors.subtitle} />
    </TouchableOpacity>
  );
}
