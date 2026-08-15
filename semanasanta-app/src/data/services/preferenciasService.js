import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistencia local del dispositivo (no de Firestore): recuerda la ciudad elegida
// -ya sea por geolocalización o a mano- para no volver a preguntar en el próximo arranque.
const CLAVE_CIUDAD_ID = '@semanasanta/ciudadId';

// Con qué rol entró el usuario la última vez ('ciudadano', sin cuenta; el resto
// -Cofrade, Junta de Cofradía, Administrador- inician sesión y no se guardan
// aquí todavía: llegará con la cuenta real en una iteración posterior).
// Así la pantalla de bienvenida (elegir Ciudadano / Iniciar sesión) solo se
// muestra la primera vez.
const CLAVE_MODO_ACCESO = '@semanasanta/modoAcceso';

// AsyncStorage solo guarda strings; ciudad.id es un Long numérico desde que
// viene del backend real (antes, con el mock, era un slug de texto y
// "funcionaba" por casualidad). Se convierte aquí en los dos sentidos para
// que la comparación en arranqueCiudadano.js (ciudad.id === idGuardada)
// siga comparando number contra number.
export async function getCiudadIdGuardada() {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_CIUDAD_ID);
    return valor !== null ? Number(valor) : null;
  } catch {
    return null;
  }
}

export async function guardarCiudadId(ciudadId) {
  try {
    await AsyncStorage.setItem(CLAVE_CIUDAD_ID, String(ciudadId));
  } catch {
    // Si falla el guardado no bloqueamos la navegación; en el próximo arranque se
    // volverá a preguntar, lo cual es un fallback aceptable.
  }
}

export async function getModoAccesoGuardado() {
  try {
    return await AsyncStorage.getItem(CLAVE_MODO_ACCESO);
  } catch {
    return null;
  }
}

export async function guardarModoAcceso(modoAcceso) {
  try {
    await AsyncStorage.setItem(CLAVE_MODO_ACCESO, modoAcceso);
  } catch {
    // Igual que con la ciudad: si falla, en el próximo arranque se vuelve a
    // mostrar la bienvenida, que es un fallback razonable.
  }
}
