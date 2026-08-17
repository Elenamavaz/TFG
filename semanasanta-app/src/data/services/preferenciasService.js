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

// Ids de las notificaciones (Aviso o Alerta) que el usuario descartó a mano
// en Inicio (icono de papelera, ver HomeScreen): no se borra nada en el
// backend -el ciudadano no tiene sesión ni permisos para eso-, solo se dejan
// de mostrar en ESTE dispositivo. Puede haber varias a la vez desde que
// Inicio muestra un carrusel deslizable, no una sola.
const CLAVE_NOTIFICACIONES_DESCARTADAS_IDS = '@semanasanta/notificacionesDescartadasIds';

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

// "Cerrar sesión" del Ciudadano/Cofrade (ver PerfilScreen): ninguno de los
// dos tiene JWT que invalidar (el Ciudadano no se registra, RI-01; el modo
// Cofrade de esta pantalla es solo un selector local, sin login de código de
// acceso conectado todavía) -así que "cerrar sesión" aquí es "olvidar en
// este dispositivo qué ciudad y qué modo había elegido", para que la
// próxima vez vuelva a preguntar desde Bienvenida.
export async function olvidarSesionLocal() {
  try {
    await AsyncStorage.multiRemove([CLAVE_CIUDAD_ID, CLAVE_MODO_ACCESO]);
  } catch {
    // Si falla, en el próximo arranque puede que se salte Bienvenida -no es
    // grave, la propia pantalla ya ha navegado allí en esta sesión.
  }
}

// Lista de ids (Long del backend, JSON en vez de un único string -mismo
// motivo que ciudadId, pero ahora son varios a la vez).
export async function getNotificacionesDescartadasIds() {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_NOTIFICACIONES_DESCARTADAS_IDS);
    return valor ? JSON.parse(valor) : [];
  } catch {
    return [];
  }
}

export async function descartarNotificacion(notificacionId) {
  try {
    const actuales = await getNotificacionesDescartadasIds();
    if (actuales.includes(notificacionId)) return;
    await AsyncStorage.setItem(
      CLAVE_NOTIFICACIONES_DESCARTADAS_IDS,
      JSON.stringify([...actuales, notificacionId])
    );
  } catch {
    // Si falla el guardado, en el próximo arranque volvería a mostrarse la
    // misma notificación -molesto, pero no rompe nada.
  }
}
