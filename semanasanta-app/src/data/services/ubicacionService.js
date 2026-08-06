import * as Location from 'expo-location';

// Acceso al GPS del dispositivo, para preseleccionar la ciudad más cercana en el primer arranque.
export async function solicitarPermisoUbicacion() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function obtenerPosicionActual() {
  try {
    const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return { latitud: posicion.coords.latitude, longitud: posicion.coords.longitude };
  } catch {
    return null;
  }
}
