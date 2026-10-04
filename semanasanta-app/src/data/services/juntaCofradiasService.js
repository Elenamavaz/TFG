import { api } from '../../infrastructure';
import * as models from '../models';

// Gestión (panel de Administrador): las escrituras exigen JWT de
// Administrador en el backend, así que solo tienen sentido con sesión ya
// iniciada. GET /juntas-cofradias es público pero siempre devuelve todas
// -a diferencia de Ciudad, no hay un filtro "solo activas" porque no hay
// pantalla de ciudadano que las liste; quien las consulta es siempre el panel.

export async function getJuntasCofradias() {
  const juntas = await api.apiFetch('/juntas-cofradias');
  return juntas.map((j) => new models.JuntaCofradias(j));
}

export async function getJuntaCofradiasPorId(id) {
  const junta = await api.apiFetch(`/juntas-cofradias/${id}`);
  return new models.JuntaCofradias(junta);
}

export async function crearJuntaCofradias(datos) {
  const junta = await api.apiFetch('/juntas-cofradias', { method: 'POST', body: datos });
  return new models.JuntaCofradias(junta);
}

export async function actualizarJuntaCofradias(id, datos) {
  const junta = await api.apiFetch(`/juntas-cofradias/${id}`, { method: 'PUT', body: datos });
  return new models.JuntaCofradias(junta);
}

export async function eliminarJuntaCofradias(id) {
  await api.apiFetch(`/juntas-cofradias/${id}`, { method: 'DELETE' });
}
