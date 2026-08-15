import { apiFetch } from '../../infrastructure/api/apiClient';
import { Cofradia } from '../models';

// GET /cofradias?ciudadId= y GET /cofradias/{id} son públicos (RI-01).

export async function getCofradiasPorCiudad(ciudadId) {
  const cofradias = await apiFetch(`/cofradias?ciudadId=${ciudadId}`);
  return cofradias.map((c) => new Cofradia(c));
}

export async function getCofradiaPorId(cofradiaId) {
  const cofradia = await apiFetch(`/cofradias/${cofradiaId}`);
  return new Cofradia(cofradia);
}
