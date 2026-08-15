import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistencia local del JWT de Junta/Administrador (login real, ver
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

export async function guardarSesion({ token, rol, usuarioId }) {
  try {
    await AsyncStorage.setItem(CLAVE_SESION, JSON.stringify({ token, rol, usuarioId }));
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
