import { Ciudad } from '../models';

export const ciudadesMock = [
  new Ciudad({ id: 'valladolid', nombre: 'Valladolid', comunidadAutonoma: 'Castilla y León', numProcesiones: 57, numCofrades: 45000 }),
  new Ciudad({ id: 'zamora', nombre: 'Zamora', comunidadAutonoma: 'Castilla y León', numProcesiones: 17, numCofrades: 12000 }),
  new Ciudad({ id: 'malaga', nombre: 'Málaga', comunidadAutonoma: 'Andalucía', numProcesiones: 42, numCofrades: 65000 }),
  new Ciudad({ id: 'granada', nombre: 'Granada', comunidadAutonoma: 'Andalucía', numProcesiones: 32, numCofrades: 40000 }),
  new Ciudad({ id: 'cordoba', nombre: 'Córdoba', comunidadAutonoma: 'Andalucía', numProcesiones: 34, numCofrades: 38000 }),
];
