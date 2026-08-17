import { apiFetch } from '../../infrastructure/api/apiClient';

// Autoservicio de un miembro de Junta desactivado (ver CuentaDesactivadaScreen):
// pide que el Administrador le reactive la cuenta. El backend acepta la
// llamada aunque esté desactivado -es la única escritura de Junta que se le
// permite, ver MiembroJuntaCofradiaService.solicitarReactivacion.
export async function solicitarReactivacion() {
  await apiFetch('/miembros-junta/solicitar-reactivacion', { method: 'POST' });
}

// Panel de Administrador: solicitudes de reactivación pendientes de revisar
// (ver SolicitudesReactivacionScreen).
export async function getSolicitudesReactivacion() {
  return apiFetch('/miembros-junta/solicitudes-reactivacion');
}

export async function aceptarReactivacion(id) {
  return apiFetch(`/miembros-junta/${id}/aceptar-reactivacion`, { method: 'POST' });
}

export async function rechazarReactivacion(id) {
  return apiFetch(`/miembros-junta/${id}/rechazar-reactivacion`, { method: 'POST' });
}
