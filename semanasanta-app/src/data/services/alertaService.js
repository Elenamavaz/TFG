import { apiFetch } from '../../infrastructure/api/apiClient';
import { Notificacion } from '../models';

// GET /notificaciones?ciudadId= es público y ya viene ordenado por
// fechaCreacion descendente (ver NotificacionService.listarDeCiudad del
// backend). Ya no hay que discriminar por clase (Aviso/Alerta, colapsadas en
// una sola desde el 2026-08-20) -solo se descartan las ya caducadas
// (Notificacion.activa, ver el modelo). El backend no liga ninguna
// notificación a un día de Semana Santa ni a una procesión/evento concreto
// (ver memoria del TFG, 2026-08-15) -no hay "las de este día", solo "las
// activas de esta ciudad ahora mismo".
export async function getNotificacionesActivas(ciudadId) {
  const notificaciones = await apiFetch(`/notificaciones?ciudadId=${ciudadId}`);
  return notificaciones.map((n) => new Notificacion(n)).filter((n) => n.activa);
}
