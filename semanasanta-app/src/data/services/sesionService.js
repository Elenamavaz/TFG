import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../infrastructure';

// Persistencia local del JWT de Junta/Administrador/Cofrade (login real, ver
// authService.js) -distinto de preferenciasService: eso es preferencias sin
// credenciales, esto es la sesión autenticada en sí. No hay renovación
// automática todavía: si el token caduca (24h por defecto en el backend,
// jwt.expiration-ms), la próxima llamada autenticada fallará y habrá que
// volver a iniciar sesión -aceptable mientras no exista ningún panel real
// que haga llamadas autenticadas.
const CLAVE_SESION = '@semanasanta/sesion';

export async function getSesionGuardada() {
  try {
    const valor = await AsyncStorage.getItem(CLAVE_SESION);
    return valor ? JSON.parse(valor) : null;
  } catch {
    return null;
  }
}

export async function guardarSesion({ token, rol, usuarioId, activo, passwordProvisional = false }) {
  try {
    await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify({ token, rol, usuarioId, activo, passwordProvisional }));
  } catch {
    // Si falla el guardado, la sesión sigue activa en memoria (AuthContext)
    // hasta cerrar la app; en el próximo arranque simplemente no se recuerda.
  }
}

export async function borrarSesion() {
  try {
    await AsyncStorage.removeItem(CLAVE_SESION);
  } catch {
    // No hay nada mejor que hacer si falla el borrado; en el peor caso queda
    // un token viejo guardado que el backend rechazará igualmente al caducar.
  }
}

// El JWT dura 24h (jwt.expiration-ms del backend). Al arrancar la app con
// una sesión guardada de hace días, se comprueba aquí su "exp" en vez de
// dejar entrar al panel y que cada acción falle (bug 8 de bugs.md). Solo se
// lee el payload, sin verificar la firma: eso lo hace el backend.
export function sesionHaCaducado(sesion) {
  try {
    const base64 = sesion.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const relleno = '='.repeat((4 - (base64.length % 4)) % 4);
    const { exp } = JSON.parse(atob(base64 + relleno));
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return false; // si no se puede leer, que decida el backend en la primera petición
  }
}

// Qué hacer cuando el backend rechaza una petición por sesión caducada
// (ver apiClient.configurarSesionCaducada); lo registra AuthContext.
export function configurarSesionCaducada(callback) {
  api.configurarSesionCaducada(callback);
}
