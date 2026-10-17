import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registrarPosicion } from './posicionActualService';

// Seguimiento GPS del cofrade en SEGUNDO PLANO (bug 6 de bugs.md,
// 2026-10-16). Antes los pings salían de un setInterval de JavaScript en
// CofradeContext, que se para en cuanto se bloquea la pantalla o la app
// pasa a segundo plano -justo lo normal durante una procesión real-. Ahora
// el sistema operativo entrega las posiciones a una tarea de
// expo-task-manager aunque la app no esté en pantalla (en Android, con un
// servicio en primer plano y su notificación fija "Compartiendo ubicación").
//
// La tarea no tiene acceso al estado de React: lo que necesita (procesión y
// JWT) se guarda en AsyncStorage al empezar, y si tiene que parar por su
// cuenta (procesión finalizada, código revocado...) deja el motivo guardado
// para que CofradeContext lo muestre al volver a la app.
//
// Necesita un build nativo nuevo (development build o APK): no funciona en
// Expo Go, y añade los permisos de ubicación en segundo plano (app.json).

export const TAREA_SEGUIMIENTO = 'semanasanta-seguimiento-procesion';

const CLAVE_SEGUIMIENTO = '@semanasanta/seguimiento'; // { procesionId, procesionNombre, token }
const CLAVE_MOTIVO_FIN = '@semanasanta/seguimientoMotivoFin';

// Mismo ritmo que el modo antiguo (CofradeContext.INTERVALO_PING_MS). En
// Android lo respeta timeInterval; iOS ignora esa opción y entrega por
// distancia, así que además se descartan aquí las posiciones demasiado seguidas.
const INTERVALO_PING_MS = 30000;
const MARGEN_PING_MS = 5000;
const STATUS_FIN_SEGUIMIENTO = [401, 403, 410];

let ultimoPing = 0;

// Tiene que definirse en el ámbito superior del módulo (lo exige
// expo-task-manager): este fichero se importa desde services/index.js, que
// carga App.js al arrancar.
TaskManager.defineTask(TAREA_SEGUIMIENTO, async ({ data, error }) => {
  if (error || !data?.locations?.length) return;
  if (Date.now() - ultimoPing < INTERVALO_PING_MS - MARGEN_PING_MS) return;

  const seguimiento = await leerSeguimiento();
  if (!seguimiento) {
    await detenerSeguimiento();
    return;
  }

  const { latitude, longitude } = data.locations[data.locations.length - 1].coords;
  ultimoPing = Date.now();
  try {
    await registrarPosicion(seguimiento.procesionId, latitude, longitude, seguimiento.token);
  } catch (err) {
    // 410: la procesión ya no está en curso. 401/403: sesión caducada o
    // código revocado. Errores de red: se ignoran, se reintenta en el siguiente.
    if (STATUS_FIN_SEGUIMIENTO.includes(err.status)) {
      await guardarMotivoFin(err.message);
      await detenerSeguimiento();
    }
  }
});

async function leerSeguimiento() {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_SEGUIMIENTO);
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

async function guardarMotivoFin(motivo) {
  try {
    await AsyncStorage.setItem(CLAVE_MOTIVO_FIN, motivo || 'Se ha dejado de compartir tu ubicación.');
  } catch {
    // sin el motivo, CofradeContext solo verá que el seguimiento ya no está activo
  }
}

// Devuelve 'segundoPlano' si el sistema ha aceptado el seguimiento en
// segundo plano, o 'soloPrimerPlano' si no hay permiso para ello (el
// usuario no eligió "Permitir todo el tiempo") o el dispositivo no lo
// soporta (p.ej. Expo Go): en ese caso CofradeContext vuelve al modo
// antiguo, que solo funciona con la app abierta.
export async function iniciarSeguimiento({ procesionId, procesionNombre, token }) {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') return 'soloPrimerPlano';

    await AsyncStorage.setItem(CLAVE_SEGUIMIENTO, JSON.stringify({ procesionId, procesionNombre, token }));
    await AsyncStorage.removeItem(CLAVE_MOTIVO_FIN);
    ultimoPing = 0;
    await Location.startLocationUpdatesAsync(TAREA_SEGUIMIENTO, {
      accuracy: Location.Accuracy.High,
      timeInterval: INTERVALO_PING_MS,
      distanceInterval: 10,
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
      activityType: Location.ActivityType.Fitness,
      foregroundService: {
        notificationTitle: 'Compartiendo ubicación',
        notificationBody: `Tu cofradía está siguiendo "${procesionNombre}". Abre la app para dejar de compartir.`,
        killServiceOnDestroy: false,
      },
    });
    return 'segundoPlano';
  } catch {
    await AsyncStorage.removeItem(CLAVE_SEGUIMIENTO).catch(() => {});
    return 'soloPrimerPlano';
  }
}

export async function detenerSeguimiento() {
  try {
    await AsyncStorage.removeItem(CLAVE_SEGUIMIENTO);
    if (await Location.hasStartedLocationUpdatesAsync(TAREA_SEGUIMIENTO)) {
      await Location.stopLocationUpdatesAsync(TAREA_SEGUIMIENTO);
    }
  } catch {
    // la tarea ya estaba parada
  }
}

// Al abrir la app o volver a ella: si el seguimiento sigue en marcha
// devuelve { procesionId, procesionNombre }; si la tarea paró sola, el
// motivo (y lo borra, para mostrarlo una sola vez).
export async function getEstadoSeguimiento() {
  try {
    const activo = await Location.hasStartedLocationUpdatesAsync(TAREA_SEGUIMIENTO);
    const seguimiento = activo ? await leerSeguimiento() : null;
    const motivoFin = await AsyncStorage.getItem(CLAVE_MOTIVO_FIN);
    if (motivoFin) await AsyncStorage.removeItem(CLAVE_MOTIVO_FIN);
    return { seguimiento, motivoFin };
  } catch {
    return { seguimiento: null, motivoFin: null };
  }
}
