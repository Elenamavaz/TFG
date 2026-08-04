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

export const PrioridadAlerta = Object.freeze({
  BAJA: 'BAJA',
  MEDIA: 'MEDIA',
  ALTA: 'ALTA',
  URGENTE: 'URGENTE',
});

export const TipoNotificacion = Object.freeze({
  INICIO_PROCESION: 'INICIO_PROCESION',
  CAMBIO_ESTADO: 'CAMBIO_ESTADO',
  CERCANIA_PROCESION: 'CERCANIA_PROCESION',
  RECORDATORIO: 'RECORDATORIO',
});

export const TipoPuntoInteres = Object.freeze({
  MONUMENTO: 'MONUMENTO',
  IGLESIA: 'IGLESIA',
  ENCUENTRO: 'ENCUENTRO',
  ORACION: 'ORACION',
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
});

export const TipoAlerta = Object.freeze({
  INCIDENCIA: 'INCIDENCIA',
  CAMBIO_HORARIO: 'CAMBIO_HORARIO',
  CANCELACION: 'CANCELACION',
  CORTE_CALLE: 'CORTE_CALLE',
  METEOROLOGIA: 'METEOROLOGIA',
  SEGURIDAD: 'SEGURIDAD',
});
