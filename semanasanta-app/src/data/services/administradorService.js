import { api } from '../../infrastructure';

// GET /administradores/{id} ya existía (para que otro Admin consulte una
// cuenta); se reutiliza aquí para precargar el propio formulario de "Editar
// perfil" -no hay un GET "/perfil" aparte, el id lo da AuthContext.sesion.usuarioId.
export async function obtenerAdministrador(id) {
  return api.apiFetch(`/administradores/${id}`);
}

// Pantalla "Administradores" del panel (2026-10-31): mismo funcionamiento
// que los miembros de Junta -el alta no lleva contraseña, la genera el
// backend y se la manda por correo; reenviarInvitacionAdministrador genera
// otra nueva mientras no la haya cambiado.
export async function getAdministradores() {
  return api.apiFetch('/administradores');
}

export async function crearAdministrador({ nombre, email, telefono }) {
  return api.apiFetch('/administradores', {
    method: 'POST',
    body: { nombre, email, telefono: telefono || null },
  });
}

export async function reenviarInvitacionAdministrador(id) {
  return api.apiFetch(`/administradores/${id}/reenviar-invitacion`, { method: 'POST' });
}

export async function eliminarAdministrador(id) {
  return api.apiFetch(`/administradores/${id}`, { method: 'DELETE' });
}

// PUT /administradores/perfil: siempre el propio Administrador autenticado
// (el id sale del JWT en el backend, no se manda). Pide passwordActual
// siempre, cambie o no la contraseña -ver AdministradorPerfilRequest del
// backend. passwordNueva en blanco significa "no cambiar la contraseña".
export async function actualizarPerfilPropio({ nombre, telefono, passwordActual, passwordNueva }) {
  return api.apiFetch('/administradores/perfil', {
    method: 'PUT',
    body: { nombre, telefono: telefono || null, passwordActual, passwordNueva: passwordNueva || '' },
  });
}
