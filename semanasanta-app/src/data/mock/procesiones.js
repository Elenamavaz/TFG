import { Procesion, Recorrido, PuntoDeInteres, EstadoProcesion } from '../models';

function recorridoDesde(id, nombreCalles) {
  return new Recorrido({
    id: `${id}-recorrido`,
    nombre: `Recorrido de ${id}`,
    puntos: nombreCalles.map((nombre, indice) => new PuntoDeInteres({ id: `${id}-punto-${indice}`, nombre })),
  });
}

export const procesionesMock = [
  new Procesion({
    id: 'amor-materno',
    ciudadId: 'valladolid',
    cofradiaId: 'vera-cruz',
    nombre: 'Procesión del Amor Materno',
    dia: 'Viernes Santo',
    horaSalida: '00:30',
    duracionMin: 405,
    nazarenos: 2800,
    estado: EstadoProcesion.PROGRAMADA,
    pasoIds: ['sentencia', 'esperanza'],
    recorrido: recorridoDesde('amor-materno', ['Calle Feria', 'La Campana', 'Catedral', 'Feria']),
  }),
  new Procesion({
    id: 'regla',
    ciudadId: 'valladolid',
    cofradiaId: 'vera-cruz',
    nombre: 'Procesión de Regla de la Santa Vera-Cruz',
    dia: 'Viernes Santo',
    horaSalida: '00:30',
    duracionMin: 405,
    nazarenos: 2800,
    estado: EstadoProcesion.PROGRAMADA,
    pasoIds: ['sentencia', 'esperanza'],
    recorrido: recorridoDesde('regla', ['San Lorenzo', 'Sierpes', 'Catedral']),
  }),
  new Procesion({
    id: 'peregrinacion-promesa',
    ciudadId: 'valladolid',
    cofradiaId: 'santo-cristo-luz',
    nombre: 'La Peregrinación de la Promesa',
    dia: 'Martes Santo',
    horaSalida: '22:30',
    duracionMin: 150,
    nazarenos: 2800,
    estado: EstadoProcesion.EN_CURSO,
    pasoIds: ['cristo-luz'],
    recorrido: recorridoDesde('peregrinacion-promesa', ['Plaza de Santa Cruz', 'Catedral', 'Plaza de Santa Cruz']),
    historia:
      'La Hermandad Universitaria del Santo Cristo de la Luz nació oficialmente en el año 1941, en plena posguerra española, bajo el impulso de un entusiasta grupo de catedráticos, profesores y estudiantes de la Universidad de Valladolid (UVa). El propósito fundacional era claro y distintivo: estrechar los lazos entre el mundo académico y científico de la ciudad y la profunda tradición religiosa y penitencial de la Semana Santa castellana. Desde sus primeros estatutos, se determinó que el Rector de la Universidad ostentase el cargo de Hermano Mayor Honorario de la cofradía, consolidando una alianza institucional que perdura hasta el día de hoy. Los cofrades de esta hermandad se diferencian por una singular carga de simbolismo estudiantil: visten una túnica de riguroso tono negro, ceñida con un cíngulo rojo, y portan sobre el pecho una beca de color rojo.',
    origen:
      'La procesión denominada "La Peregrinación de la Promesa" es una de las incorporaciones más bellas y sobrecogedoras de la era moderna en la Pasión vallisoletana, integrándose oficialmente en el programa de la Junta de Cofradías en el año 1993. El desfile fue concebido para dotar a la noche del Martes Santo de una atmósfera de misticismo, recogimiento y austeridad absoluta. El origen del nombre de este desfile radica en el ritual litúrgico que define su identidad: el juramento de silencio. Antes de iniciar la comitiva en la Plaza de Santa Cruz, los hermanos realizan una promesa pública de mantener un silencio sepulcral durante toda la estación de penitencia, roto únicamente por el rítmico y apagado golpear de tres tambores destemplados y el lamento de dos cornetas.',
    webOficial: 'https://jcssva.org/procesiones/procesion-peregrinacion-promesa-n12/',
  }),
];
