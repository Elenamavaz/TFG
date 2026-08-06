import { Ciudad } from '../models';

export const ciudadesMock = [
  new Ciudad({
    id: 'valladolid',
    nombre: 'Valladolid',
    comunidadAutonoma: 'Castilla y León',
    numProcesiones: 57,
    numCofrades: 45000,
    latitud: 41.6523,
    longitud: -4.7245,
  }),
  new Ciudad({
    id: 'zamora',
    nombre: 'Zamora',
    comunidadAutonoma: 'Castilla y León',
    numProcesiones: 17,
    numCofrades: 12000,
    latitud: 41.5033,
    longitud: -5.7446,
  }),
  new Ciudad({
    id: 'malaga',
    nombre: 'Málaga',
    comunidadAutonoma: 'Andalucía',
    numProcesiones: 42,
    numCofrades: 65000,
    latitud: 36.7213,
    longitud: -4.4214,
  }),
  new Ciudad({
    id: 'granada',
    nombre: 'Granada',
    comunidadAutonoma: 'Andalucía',
    numProcesiones: 32,
    numCofrades: 40000,
    latitud: 37.1773,
    longitud: -3.5986,
  }),
  new Ciudad({
    id: 'cordoba',
    nombre: 'Córdoba',
    comunidadAutonoma: 'Andalucía',
    numProcesiones: 34,
    numCofrades: 38000,
    latitud: 37.8882,
    longitud: -4.7794,
  }),
];
