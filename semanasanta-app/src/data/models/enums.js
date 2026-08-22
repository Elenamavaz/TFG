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

// No está en el diagrama (que solo define EstadoEvento): "procesión" es femenino
// y ya se usaban formas femeninas ('PROGRAMADA', 'EN_CURSO'...) en los datos mock.
export const EstadoProcesion = Object.freeze({
  PROGRAMADA: 'PROGRAMADA',
  EN_CURSO: 'EN_CURSO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
});

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
// las genera el sistema; INCIDENCIA/CAMBIO_HORARIO/CANCELACION las crea la Junta.
export const TipoNotificacion = Object.freeze({
  INICIO: 'INICIO',
  FIN: 'FIN',
  INCIDENCIA: 'INCIDENCIA',
  CAMBIO_HORARIO: 'CAMBIO_HORARIO',
  CANCELACION: 'CANCELACION',
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

