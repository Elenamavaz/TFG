import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Puerto por defecto de Spring Boot (backend/src/main/resources/application.properties
// no fija server.port, así que es el 8080 de siempre).
const BACKEND_PORT = 8080;

// Aún no hay backend desplegado (Railway pendiente, ver memoria del TFG): en
// desarrollo, la app y el backend corren en la misma máquina (tu PC), pero
// "misma máquina" significa cosas distintas según cómo se esté probando:
// - Expo Web: el navegador SÍ puede usar localhost tal cual (mismo origen).
// - Android/iOS (emulador o Expo Go en el móvil físico, misma WiFi):
//   "localhost" en el dispositivo es el propio dispositivo, no tu PC. Se
//   resuelve reutilizando el host que ya usa Metro para servir el bundle
//   (Constants.expoConfig.hostUri, algo como "192.168.1.23:8081") y
//   cambiándole el puerto por el del backend -es la misma IP LAN por la que
//   el dispositivo ya te está viendo, así que siempre es alcanzable.
function resolverBaseUrl() {
  if (Platform.OS === 'web') {
    return `http://localhost:${BACKEND_PORT}`;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:${BACKEND_PORT}`;
  }

  // Sin hostUri (p.ej. build de producción sin servidor de Metro delante):
  // hace falta una URL real configurada (Railway) antes de llegar aquí. Por
  // ahora, mientras no exista ese despliegue, no hay mejor fallback posible.
  return `http://localhost:${BACKEND_PORT}`;
}

const BASE_URL = resolverBaseUrl();

// TODO(iteración 3+): cuando exista login (Junta/Admin/Cofrade), añadir aquí
// la cabecera "Authorization: Bearer <token>" leyendo el JWT guardado -las
// llamadas públicas de ciudadano (GET sin JWT en el backend, ver
// SecurityConfig) seguirán funcionando igual sin tocar nada.
export async function apiFetch(path, options = {}) {
  const { body, headers, ...resto } = options;
  const response = await fetch(`${BASE_URL}${path}`, {
    ...resto,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const texto = await response.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    // GlobalExceptionHandler del backend siempre responde { mensaje: "..." }
    // en los errores que traduce a propósito (404/401/403/409/400); para el
    // resto (500 sin traducir), no hay "mensaje" y se cae al texto genérico.
    throw new Error(datos?.mensaje ?? `Error ${response.status} al llamar a ${path}`);
  }

  return datos;
}
