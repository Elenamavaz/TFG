import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistencia local del dispositivo (no de Firestore): recuerda la ciudad elegida
// -ya sea por geolocalización o a mano- para no volver a preguntar en el próximo arranque.
const CLAVE_CIUDAD_ID = '@semanasanta/ciudadId';

export async function getCiudadIdGuardada() {
  try {
    return await AsyncStorage.getItem(CLAVE_CIUDAD_ID);
  } catch {
    return null;
  }
}

export async function guardarCiudadId(ciudadId) {
  try {
    await AsyncStorage.setItem(CLAVE_CIUDAD_ID, ciudadId);
  } catch {
    // Si falla el guardado no bloqueamos la navegación; en el próximo arranque se
    // volverá a preguntar, lo cual es un fallback aceptable.
  }
}
