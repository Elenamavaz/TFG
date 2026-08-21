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

// POST /notificaciones (Junta de la ciudad, ver NotificacionController):
// para CAMBIO_HORARIO/INCIDENCIA, avisos puntuales que no llevan cambio de
// estado asociado -distinto de cancelarProcesion, que además cambia el
// estado de la procesión en el mismo paso (ver ProcesionService.cancelar).
export async function crearNotificacion({ titulo, mensaje, ciudadId, tipo, prioridad }) {
  const notificacion = await apiFetch('/notificaciones', {
    method: 'POST',
    body: { titulo, mensaje: mensaje || null, ciudadId, tipo, prioridad },
  });
  return new Notificacion(notificacion);
}
