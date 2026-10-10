import { useState } from 'react';
import { View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../theme';
import { estiloMapaOscuro } from './estiloMapa';
import { styles } from './mapas.styles';

// Mapa pequeño con el sitio donde se celebra un evento (2026-10-04, mockup
// de Elena): marcador redondo con una estrella sobre la Ubicacion del
// evento. Solo Android/iOS; en web se usa MapaUbicacion.js.
export function MapaUbicacion({ latitud, longitud, titulo }) {
  const [ancho, setAncho] = useState(null); // ver MapaRecorrido: tamaño exacto medido
  if (latitud == null || longitud == null) return null;
  const coordenada = { latitude: latitud, longitude: longitud };

  return (
    <View style={styles.tarjeta} onLayout={(e) => setAncho(e.nativeEvent.layout.width)}>
      {ancho ? (
        <MapView
          style={{ ...styles.mapa, width: ancho }}
          // Google Maps en Android; en iOS, Apple Maps (no necesita API key).
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          //customMapStyle={estiloMapaOscuro}
          initialRegion={{ ...coordenada, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
          zoomControlEnabled
          toolbarEnabled={false}
        >
          <Marker coordinate={coordenada} title={titulo} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.marcadorEstrella}>
              <Ionicons name="star" size={18} color={colors.background} />
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={styles.mapa} />
      )}
    </View>
  );
}
