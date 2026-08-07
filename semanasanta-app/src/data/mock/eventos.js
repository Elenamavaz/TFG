import { Evento, EstadoEvento, Ubicacion } from '../models';

export const eventosMock = [
  new Evento({
    id: 'via-crucis-exaltacion',
    cofradiaId: 'vera-cruz',
    nombre: 'Vía Crucis de la Exaltación',
    descripcion: 'Vía Crucis organizado por la Cofradía de la Santa Vera-Cruz.',
    historia:
      'El Vía Crucis de la Exaltación recorre las catorce estaciones tradicionales partiendo del interior de la Iglesia Penitencial, con el Cristo de la Sentencia a hombros de los costaleros. En cada estación se guarda un silencio absoluto roto solo por la lectura de la meditación correspondiente y el canto, a capela, de un motete penitencial por parte de la Schola Cantorum de la cofradía. No es una procesión con música de banda: es un acto de recogimiento que abre oficialmente los cultos de la Semana Santa vallisoletana.',
    fecha: '2027-03-21',
    dia: 'Domingo de Ramos',
    hora: '21:00',
    duracionMin: 90,
    estado: EstadoEvento.PROGRAMADO,
    ubicacion: new Ubicacion({ latitud: null, longitud: null, direccion: 'Iglesia Penitencial de la Santa Vera-Cruz' }),
  }),
  new Evento({
    id: 'peregrinacion-promesa-evento',
    cofradiaId: 'santo-cristo-luz',
    nombre: 'La Peregrinación de la Promesa',
    descripcion: 'Peregrinación fundacional de la Cofradía Universitaria del Santo Cristo de la Luz.',
    historia:
      'Antes de que la comitiva se ponga en marcha, los hermanos se reúnen en la Plaza de Santa Cruz para realizar el juramento de silencio: una promesa pública de mantener un silencio sepulcral durante toda la estación de penitencia, que da nombre al evento. El acto lo preside el Hermano Mayor Honorario -tradicionalmente el Rector de la Universidad- y se cierra con el rítmico y apagado golpear de tres tambores destemplados, único sonido permitido hasta que la comitiva regresa al punto de partida.',
    fecha: '2027-03-23',
    dia: 'Martes Santo',
    hora: '22:30',
    duracionMin: 150,
    estado: EstadoEvento.EN_CURSO,
    ubicacion: new Ubicacion({ latitud: null, longitud: null, direccion: 'Plaza de Santa Cruz' }),
  }),
];
