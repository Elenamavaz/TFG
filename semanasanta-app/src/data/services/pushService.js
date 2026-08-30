import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiFetch } from '../../infrastructure/api/apiClient';

// Notificaciones push (2026-08-23): Expo Push, no Firebase/APNs directamente
// -ver PushNotificacionService del backend. expo-notifications abstrae la
// plataforma; el backend solo habla con la API de Expo (exp.host), nunca
// con Firebase ni con certificados de Apple.
//
// Dos cosas tienen que existir para que esto funcione de verdad, ninguna de
// las dos depende de este código:
// - Un projectId de EAS (`eas init` en el proyecto, todavía no ejecutado).
// - Un development build del cliente -Expo Go ya no admite push remoto
//   desde hace varias versiones de Expo (incluida la 57 de este proyecto).
// Sin ellas, obtenerTokenPush() falla en silencio (try/catch, devuelve
// null) y sencillamente no se registra nada -nunca bloquea el arranque de
// la app ni lanza un error visible al Ciudadano.

// Llamar una sola vez al arrancar la app (ver App.js): cómo se comporta una
// notificación que llega con la app abierta, y el canal obligatorio en
// Android 8+ para que el sistema la muestre.
export async function configurarManejoNotificaciones() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'General',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

async function obtenerTokenPush() {
  try {
    const permisoActual = await Notifications.getPermissionsAsync();
    let status = permisoActual.status;
    if (status !== 'granted') {
      const solicitud = await Notifications.requestPermissionsAsync();
      status = solicitud.status;
    }
    if (status !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return null; // sin `eas init` todavía, ver comentario de arriba

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return token;
  } catch {
    return null; // Expo Go sin soporte de push remoto, permiso denegado, o cualquier otro fallo
  }
}

// Se llama cada vez que se resuelve la ciudad del Ciudadano -guardada, por
// GPS (ver arranqueCiudadano.js) o elegida a mano (ver SeleccionCiudadScreen)-
// porque las notificaciones son por ciudad, no por usuario (el Ciudadano no
// tiene cuenta). Es un upsert en el backend (mismo token, ciudad nueva), así
// que llamarlo de más no hace daño -no hay caché local que mantener aquí.
export async function registrarDispositivoPush(ciudadId) {
  const token = await obtenerTokenPush();
  if (!token) return;
  await apiFetch('/dispositivos-push', { method: 'POST', body: { token, ciudadId } }).catch(() => {});
}
