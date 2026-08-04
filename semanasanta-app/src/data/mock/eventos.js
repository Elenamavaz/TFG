import { Evento, EstadoEvento } from '../models';

export const eventosMock = [
  new Evento({
    id: 'via-crucis-exaltacion',
    cofradiaId: 'vera-cruz',
    nombre: 'Vía Crucis de la Exaltación',
    descripcion: 'Vía Crucis organizado por la Cofradía de la Santa Vera-Cruz.',
    fecha: '2027-03-21',
    hora: '21:00',
    duracionMin: 90,
    estado: EstadoEvento.PROGRAMADO,
  }),
  new Evento({
    id: 'peregrinacion-promesa-evento',
    cofradiaId: 'santo-cristo-luz',
    nombre: 'La Peregrinación de la Promesa',
    descripcion: 'Peregrinación fundacional de la Cofradía Universitaria del Santo Cristo de la Luz.',
    fecha: '2027-03-23',
    hora: '22:30',
    duracionMin: 150,
    estado: EstadoEvento.EN_CURSO,
  }),
];
