import { Cofradia } from '../models';

// pasos/procesiones/eventos de cada cofradía ya no se listan aquí: se
// resuelven a través de sus FK inversas (paso.cofradiaId, evento.cofradiaId,
// y procesion vía paso), ver src/data/models/Cofradia.js.
export const cofradiasMock = [
  new Cofradia({
    id: 'vera-cruz',
    ciudadId: 'valladolid',
    nombre: 'Cofradía Penitencial de la Santa Vera-Cruz',
    historia:
      'Diego Ortiz de Zúñiga, en sus Anales, relata que en 1593 acude a la ciudad, acompañado de otros hermanos, el monje basilio Fray Bernardo de la Cruz, para fundar en ella Colegio en "unas casas principales" de la collación de Omnium Sanctorum.',
    webOficial: 'https://www.veracruzvalladolid.es/',
  }),
  new Cofradia({
    id: 'santo-cristo-luz',
    ciudadId: 'valladolid',
    nombre: 'Cofradía Universitaria del Santo Cristo de la Luz',
    historia:
      'El Santo Cristo de la Luz es una obra de madurez del célebre escultor gallego Gregorio Fernández, realizada en torno a 1630.',
    webOficial: 'https://jcssva.org/',
  }),
];
