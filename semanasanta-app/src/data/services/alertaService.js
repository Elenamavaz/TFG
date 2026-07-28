import { alertasMock } from '../mock/alertas';

// TODO(iteración 5): sustituir por lecturas a Firestore (colección `notificaciones`, RF-27).

export function getAlertaDelDia(ciudadId, diaNombre) {
  const alerta =
    alertasMock.find((a) => a.ciudadId === ciudadId && a.dia === diaNombre) ?? null;
  return Promise.resolve(alerta);
}
