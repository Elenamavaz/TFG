import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';

// Imagen guardada como enlace (cofradía, paso). Si no hay enlace, o el
// enlace no carga -p.ej. es la página de Google Imágenes o de Drive y no el
// archivo, o la web lo ha retirado-, se ve el mismo hueco con el icono de
// "sin imagen" (placeholderStyle). Antes, un enlace roto dejaba un cuadro vacío.
export function ImagenRemota({ uri, style, placeholderStyle }) {
  const [fallo, setFallo] = useState(false);

  useEffect(() => setFallo(false), [uri]);

  if (!uri || fallo) {
    return (
      <View style={placeholderStyle ?? style}>
        <Ionicons name="image-outline" size={22} color={colors.subtitle} />
      </View>
    );
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" onError={() => setFallo(true)} />;
}
