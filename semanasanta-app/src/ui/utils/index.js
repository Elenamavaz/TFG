// Cada utilidad se importa como módulo y se usa a través de él (criterio de
// Elena, 2026-10-04): import { geo } from '.../utils' y geo.distanciaKm(...),
// en vez de importar las funciones sueltas.
export * as geo from './geo';
export * as tiempo from './tiempo';
export * as calendario from './calendario';
export * as orden from './ordenarPorNombre';
export * as arranqueCiudadano from './arranqueCiudadano';
