import { Favoriteable } from './Favoriteable';
import { partirFechaHora, minutosEntre } from '../utils/fechaSemanaSanta';

// Campos alineados con ProcesionResponse del backend -- 2026-08-15:
// - "ciudadId" directo se quita: el backend no lo da (la ciudad se llega vía
//   cofradiaIds -> Cofradia -> Ciudad), y ya no hace falta -el filtrado por
//   ciudad ahora lo hace el propio backend (ver procesionService.js).
// - "cofradiaId" único pasa a "cofradiaIds" (N:M real, igual que Evento -del
//   que Procesion hereda esa relación en el backend).
// - "nazarenos", "origen", "webOficial" no existen en el backend; se quitan.
// - "recorrido" (objeto completo en el mock) pasa a "recorridoId": resolver
//   el objeto completo queda pendiente (igual que Ubicacion en Evento).
// - dia/horaSalida se derivan del único `fecha` del backend (ver
//   partirFechaHora); duracionMin se deriva de fechaInicio/fechaFin
//   (minutosEntre) en vez de venir suelto -para que HomeScreen/
//   CalenderScreen/DetailProcesionScreen sigan funcionando sin tocarlas.
// - estado: el backend NO tiene un enum aparte para Procesion, reutiliza
//   EstadoEvento (masculino: PROGRAMADO/EN_CURSO/FINALIZADO/CANCELADO), no
//   EstadoProcesion (femenino) como asumía el mock. StatusBadge ya
//   contemplaba ambas formas, no hizo falta tocarlo.
export class Procesion extends Favoriteable {
  constructor({
    id,
    cofradiaIds = [],
    pasosIds = [],
    recorridoId = null,
    nombre,
    historia = null,
    tradicion = null,
    fecha,
    fechaInicio = null,
    fechaFin = null,
    estado,
    ubicacionId = null,
  }) {
    super();
    const partida = partirFechaHora(fecha);
    this.id = id;
    this.cofradiaIds = cofradiaIds; // participan: N Cofradia
    this.pasoIds = pasosIds; // desfilan: 1..* Paso
    this.recorridoId = recorridoId; // sigue: 0..1 Recorrido
    this.nombre = nombre;
    this.historia = historia;
    this.tradicion = tradicion;
    this.dia = partida.dia;
    this.horaSalida = partida.hora;
    this.duracionMin = minutosEntre(fechaInicio, fechaFin);
    this.estado = estado;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.ubicacionId = ubicacionId;
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'procesion' };
  }
}
