import { api } from '../../infrastructure';
import * as models from '../models';

// Gestión de Miembros (panel de Administrador, mockup del 2026-08-17): las
// escrituras exigen JWT de Administrador en el backend, así que solo tienen
// sentido con sesión ya iniciada -mismo patrón que ciudadService/
// juntaCofradiasService.

// Antes vivía en juntaCofradiasService (solo se usaba para el recuento de
// "Equipo" en Editar Junta); ahora que existe la lista real de Miembros,
// tiene más sentido aquí.
export async function getMiembrosDeJunta(juntaId) {
  const miembros = await api.apiFetch(`/juntas-cofradias/${juntaId}/miembros`);
  return miembros.map((m) => new models.MiembroJuntaCofradia(m));
}

export async function getMiembroJuntaCofradiaPorId(id) {
  const miembro = await api.apiFetch(`/miembros-junta/${id}`);
  return new models.MiembroJuntaCofradia(miembro);
}

export async function crearMiembroJuntaCofradia(datos) {
  const miembro = await api.apiFetch('/miembros-junta', { method: 'POST', body: datos });
  return new models.MiembroJuntaCofradia(miembro);
}

export async function actualizarMiembroJuntaCofradia(id, datos) {
  const miembro = await api.apiFetch(`/miembros-junta/${id}`, { method: 'PUT', body: datos });
  return new models.MiembroJuntaCofradia(miembro);
}

export async function eliminarMiembroJuntaCofradia(id) {
  await api.apiFetch(`/miembros-junta/${id}`, { method: 'DELETE' });
}

// "Editar perfil" del panel de Junta (mockup del 2026-08-18): el propio
// miembro editando SUS datos -mismo patrón que actualizarPerfilPropio de
// administradorService, sin {id} en la URL, siempre el del JWT.
export async function actualizarPerfilPropioJunta(datos) {
  const miembro = await api.apiFetch('/miembros-junta/perfil', { method: 'PUT', body: datos });
  return new models.MiembroJuntaCofradia(miembro);
}

// Genera una contraseña provisional nueva y la reenvía por correo -para un
// miembro con "invitación pendiente" que no la encuentra o la perdió.
export async function reenviarInvitacion(id) {
  const miembro = await api.apiFetch(`/miembros-junta/${id}/reenviar-invitacion`, { method: 'POST' });
  return new models.MiembroJuntaCofradia(miembro);
}

// Autoservicio de un miembro de Junta desactivado (ver CuentaDesactivadaScreen):
// pide que el Administrador le reactive la cuenta. El backend acepta la
// llamada aunque esté desactivado -es la única escritura de Junta que se le
// permite, ver MiembroJuntaCofradiaService.solicitarReactivacion.
export async function solicitarReactivacion() {
  await api.apiFetch('/miembros-junta/solicitar-reactivacion', { method: 'POST' });
}

// Panel de Administrador: solicitudes de reactivación pendientes de revisar
// (ver SolicitudesReactivacionScreen).
export async function getSolicitudesReactivacion() {
  const miembros = await api.apiFetch('/miembros-junta/solicitudes-reactivacion');
  return miembros.map((m) => new models.MiembroJuntaCofradia(m));
}

export async function aceptarReactivacion(id) {
  const miembro = await api.apiFetch(`/miembros-junta/${id}/aceptar-reactivacion`, { method: 'POST' });
  return new models.MiembroJuntaCofradia(miembro);
}

export async function rechazarReactivacion(id) {
  const miembro = await api.apiFetch(`/miembros-junta/${id}/rechazar-reactivacion`, { method: 'POST' });
  return new models.MiembroJuntaCofradia(miembro);
}
