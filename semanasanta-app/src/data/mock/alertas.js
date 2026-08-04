import { Alerta, TipoAlerta, TipoNotificacion, PrioridadAlerta } from '../models';

export const alertasMock = [
  new Alerta({
    id: 'retraso-peregrinacion-promesa',
    titulo: 'Retraso en la Peregrinación de la Promesa',
    tipo: TipoNotificacion.CAMBIO_ESTADO,
    tipoAlerta: TipoAlerta.CAMBIO_HORARIO,
    prioridad: PrioridadAlerta.MEDIA,
    ciudadId: 'valladolid',
    dia: 'Martes Santo',
    texto: 'La Peregrinación de la Promesa sale con 15 min de retraso',
    procesionId: 'peregrinacion-promesa',
  }),
];
