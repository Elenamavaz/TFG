import { api } from '../../infrastructure';
import * as models from '../models';

// Gestión de códigos de acceso desde el panel de Junta (2026-10-02). Los tres
// exigen JWT de la Junta de la ciudad de la cofradía (ver
// CodigoAccesoService del backend): el código es una credencial, por eso ni
// siquiera el GET es público (SecurityConfig lo excluye de "todo GET es
// público"). apiFetch ya adjunta el JWT de la sesión de Junta.

// Más recientes primero (ids autoincrementales: mayor id = emitido después).
export async function getCodigosAccesoDeCofradia(cofradiaId) {
  const codigos = await api.apiFetch(`/cofradias/${cofradiaId}/codigos-acceso`);
  return codigos.map((c) => new models.CodigoAcceso(c)).sort((a, b) => b.id - a.id);
}

// El código lo genera el servidor (8 caracteres), sin cuerpo en la petición.
export async function emitirCodigoAcceso(cofradiaId) {
  const codigo = await api.apiFetch(`/cofradias/${cofradiaId}/codigos-acceso`, { method: 'POST' });
  return new models.CodigoAcceso(codigo);
}

// No hay DELETE: se revoca (deja de valer para entrar) y queda en el historial.
export async function revocarCodigoAcceso(codigoId) {
  const codigo = await api.apiFetch(`/codigos-acceso/${codigoId}/revocar`, { method: 'POST' });
  return new models.CodigoAcceso(codigo);
}
