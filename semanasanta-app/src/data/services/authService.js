import { api } from '../../infrastructure';

// POST /auth/login es público (permitAll en SecurityConfig, es el propio
// login) -para Administrador y MiembroJuntaCofradia (email+contraseña).
// Devuelve { token, rol, usuarioId, activo, passwordProvisional } tal cual
// lo da el backend (AuthResponse).
export async function login(email, password) {
  return api.apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}

// Login de Cofrade (2026-08-21, ver CofradeContext): el código no se "gasta"
// -sigue siendo válido para volver a entrar-, y el backend no crea ni toca
// ningún Usuario. El JWT que devuelve tiene rol COFRADE y usuarioId es en
// realidad el id de la COFRADÍA (no hay Usuario Cofrade, ver memoria del
// TFG) -así se usa luego para filtrar sus procesiones y para las cabeceras
// Authorization de los pings de posición.
export async function loginConCodigoAcceso(codigo) {
  return api.apiFetch('/auth/codigo-acceso', { method: 'POST', body: { codigo } });
}

// PUT /usuarios/password (AuthService.cambiarPassword): sustituye la
// contraseña de la sesión actual, pidiendo la actual. Es la vía para dejar
// de tener la contraseña provisional del correo de bienvenida
// (CambiarPasswordObligatorioScreen, 2026-10-17): no pasa por
// exigirJunta, que rechaza todo lo demás mientras siga siendo provisional.
export async function cambiarPassword(passwordActual, passwordNueva) {
  await api.apiFetch('/usuarios/password', { method: 'PUT', body: { passwordActual, passwordNueva } });
}
