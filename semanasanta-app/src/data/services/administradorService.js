import { apiFetch } from '../../infrastructure/api/apiClient';

// GET /administradores/{id} ya existía (para que otro Admin consulte una
// cuenta); se reutiliza aquí para precargar el propio formulario de "Editar
// perfil" -no hay un GET "/perfil" aparte, el id lo da AuthContext.sesion.usuarioId.
export async function obtenerAdministrador(id) {
  return apiFetch(`/administradores/${id}`);
}

// PUT /administradores/perfil: siempre el propio Administrador autenticado
// (el id sale del JWT en el backend, no se manda). Pide passwordActual
// siempre, cambie o no la contraseña -ver AdministradorPerfilRequest del
// backend. passwordNueva en blanco significa "no cambiar la contraseña".
export async function actualizarPerfilPropio({ nombre, telefono, passwordActual, passwordNueva }) {
  return apiFetch('/administradores/perfil', {
    method: 'PUT',
    body: { nombre, telefono: telefono || null, passwordActual, passwordNueva: passwordNueva || '' },
  });
}
