import { Platform } from 'react-native';
import Constants from 'expo-constants';
// Import directo del archivo, no del barrel de data/services: ese barrel
// también reexporta servicios que importan este mismo apiClient (ciudadService,
// etc.) -pasar por él aquí crearía una dependencia circular en tiempo de carga.
import { getSesionGuardada } from '../../data/services/sesionService';

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

// GlobalExceptionHandler.handleValidacion (400 de @Valid en el request de
// un formulario) responde distinto al resto: no hay "mensaje" único, sino
// un mapa { nombreDelCampo: "mensaje de ese campo" } -uno por cada campo que
// falló, con el mismo nombre que la propiedad del DTO (p.ej. "nombre",
// "passwordNueva"). "campos" lleva ese mapa cuando aplica, para que cada
// pantalla pueda pintar el error justo debajo del TextInput que lo causó en
// vez de un aviso genérico; en el resto de errores (404/401/403/409/500)
// "campos" queda null y se usa el "mensaje" de siempre.
export class ApiError extends Error {
  constructor(mensaje, campos = null) {
    super(mensaje);
    this.campos = campos;
  }
}

// Cierra el TODO que había aquí desde antes de que existiera login real
// (2026-08-21, encontrado al dar 403 en /juntas-cofradias con sesión de
// Administrador iniciada): el JWT se guardaba (sesionService/AuthContext)
// pero apiFetch nunca lo mandaba -toda escritura autenticada de Junta/Admin
// llevaba fallando con 403 desde que existen esos paneles, no solo esta.
// getSesionGuardada() lee de AsyncStorage en vez de venir de un argumento:
// apiFetch es una función suelta (la usan los data/services, fuera de
// cualquier componente), no puede leer el AuthContext de React directamente.
async function cabeceraAutorizacion() {
  const sesion = await getSesionGuardada();
  return sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {};
}

export async function apiFetch(path, options = {}) {
  const { body, headers, ...resto } = options;
  // Subida de archivos (ver recorridoService.importarGpxRecorrido): un
  // FormData va tal cual, SIN "Content-Type": application/json ni
  // JSON.stringify -fetch le pone su propio Content-Type multipart con el
  // boundary correcto solo si se lo dejamos poner a él.
  const esFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const auth = await cabeceraAutorizacion();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...resto,
    headers: esFormData ? { ...auth, ...headers } : { 'Content-Type': 'application/json', ...auth, ...headers },
    body: esFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const texto = await response.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    if (response.status === 400 && datos && datos.mensaje === undefined) {
      throw new ApiError('Revisa los campos marcados.', datos);
    }
    // GlobalExceptionHandler del backend siempre responde { mensaje: "..." }
    // en el resto de errores que traduce a propósito (404/401/403/409); para
    // los que no (500 sin traducir), no hay "mensaje" y se cae al genérico.
    throw new ApiError(datos?.mensaje ?? `Error ${response.status} al llamar a ${path}`);
  }

  return datos;
}
