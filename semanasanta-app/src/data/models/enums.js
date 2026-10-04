// Enumerados del diagrama de clases del dominio.

export const EstadoCodigo = Object.freeze({
  EMITIDO: 'EMITIDO',
  VALIDADO: 'VALIDADO',
  REVOCADO: 'REVOCADO',
});

export const EstadoEvento = Object.freeze({
  PROGRAMADO: 'PROGRAMADO',
  EN_CURSO: 'EN_CURSO',
  FINALIZADO: 'FINALIZADO',
  CANCELADO: 'CANCELADO',
});

// Sin EstadoProcesion (femenino, quitado el 2026-10-04): era de los datos
// mock; el backend solo tiene EstadoEvento y Procesion lo hereda de Evento.
// En la UI todas las etiquetas de estado van en masculino (ver StatusBadge).

// Ya no es "PrioridadAlerta" -no hay clase Alerta aparte, ver Notificacion.js.
// Sin URGENTE (quitado el 2026-08-22, ver Prioridad.java del backend): en la
// práctica ya era indistinguible de ALTA en la UI (mismo rojo, ver
// Notificacion.colorCategoria), no se ganaba su sitio como cuarto nivel.
export const Prioridad = Object.freeze({
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
});

// Alineado con TipoNotificacion del backend (2026-08-20, sustituye a los
// valores viejos INICIO_PROCESION/CAMBIO_ESTADO/CERCANIA_PROCESION/
// RECORDATORIO, que no correspondían a nada real del backend). INICIO/FIN
// las genera el sistema; INCIDENCIA/CAMBIO_HORARIO/CANCELACION/ACTUALIZACION
// las crea la Junta (ACTUALIZACION desde el 2026-09-30, aviso opcional tras
// editar una procesión o evento, ver NotificarModal).
export const TipoNotificacion = Object.freeze({
  INICIO: 'INICIO',
  FIN: 'FIN',
  INCIDENCIA: 'INCIDENCIA',
  CAMBIO_HORARIO: 'CAMBIO_HORARIO',
  CANCELACION: 'CANCELACION',
  ACTUALIZACION: 'ACTUALIZACION',
});

// Valores alineados con TipoPuntoInteres del backend -- 2026-08-15: incluye
// "ORACCION" (con doble C) tal cual, es un typo real del backend, no del
// frontend; corregirlo es cosa de otra sesión, no de esta conexión. También
// se renombraron ENTRADA/SALIDA a ENTRADAPROCESION/SALIDAPROCESION y se
// añadió UBICACIONEVENTO, que no existía en el frontend.
export const TipoPuntoInteres = Object.freeze({
  MONUMENTO: 'MONUMENTO',
  IGLESIA: 'IGLESIA',
  ENCUENTRO: 'ENCUENTRO',
  ORACCION: 'ORACCION',
  ENTRADAPROCESION: 'ENTRADAPROCESION',
  SALIDAPROCESION: 'SALIDAPROCESION',
  UBICACIONEVENTO: 'UBICACIONEVENTO',
});

