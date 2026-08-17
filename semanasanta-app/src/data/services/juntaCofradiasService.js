import { apiFetch } from '../../infrastructure/api/apiClient';
import { JuntaCofradias } from '../models';

// Gestión (panel de Administrador): las escrituras exigen JWT de
// Administrador en el backend, así que solo tienen sentido con sesión ya
// iniciada. GET /juntas-cofradias es público pero siempre devuelve todas
// -a diferencia de Ciudad, no hay un filtro "solo activas" porque no hay
// pantalla de ciudadano que las liste; quien las consulta es siempre el panel.

export async function getJuntasCofradias() {
  const juntas = await apiFetch('/juntas-cofradias');
  return juntas.map((j) => new JuntaCofradias(j));
}

export async function getJuntaCofradiasPorId(id) {
  const junta = await apiFetch(`/juntas-cofradias/${id}`);
  return new JuntaCofradias(junta);
}

export async function crearJuntaCofradias(datos) {
  const junta = await apiFetch('/juntas-cofradias', { method: 'POST', body: datos });
  return new JuntaCofradias(junta);
}

export async function actualizarJuntaCofradias(id, datos) {
  const junta = await apiFetch(`/juntas-cofradias/${id}`, { method: 'PUT', body: datos });
  return new JuntaCofradias(junta);
}

export async function eliminarJuntaCofradias(id) {
  await apiFetch(`/juntas-cofradias/${id}`, { method: 'DELETE' });
}

// Solo el recuento (para el resumen "Equipo" de Editar Junta) -la lista
// completa de miembros es de la pasada siguiente, ver memoria del TFG.
export async function getMiembrosDeJunta(juntaId) {
  return apiFetch(`/juntas-cofradias/${juntaId}/miembros`);
}
