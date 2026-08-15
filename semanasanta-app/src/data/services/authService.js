import { apiFetch } from '../../infrastructure/api/apiClient';

// POST /auth/login es público (permitAll en SecurityConfig, es el propio
// login) -para Administrador y MiembroJuntaCofradia (email+contraseña); el
// Cofrade entra por código de acceso aparte (POST /auth/codigo-acceso, sin
// conectar todavía). Devuelve { token, rol, usuarioId } tal cual lo da el
// backend (AuthResponse).
export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } });
}
