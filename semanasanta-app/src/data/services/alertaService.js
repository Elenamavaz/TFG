import { apiFetch } from '../../infrastructure/api/apiClient';
import { Alerta, Aviso } from '../models';

// GET /notificaciones?ciudadId= es público y ya viene ordenado por
// fechaCreacion descendente (ver NotificacionService.listarDeCiudad del
// backend). Mezcla Avisos y Alertas -aquí se reconstruye cada uno con su
// clase real (discriminadas por el campo "tipo") y se descartan los Avisos
// ya caducados (Aviso.activa, ver el modelo). El backend no liga ninguna
// notificación a un día de Semana Santa ni a una procesión/evento concreto
// (ver memoria del TFG, 2026-08-15) -no hay "las de este día", solo "las
// activas de esta ciudad ahora mismo".
export async function getNotificacionesActivas(ciudadId) {
  const notificaciones = await apiFetch(`/notificaciones?ciudadId=${ciudadId}`);
  return notificaciones
    .map((n) => (n.tipo === 'ALERTA' ? new Alerta(n) : new Aviso(n)))
    .filter((n) => n.tipo !== 'AVISO' || n.activa);
}
