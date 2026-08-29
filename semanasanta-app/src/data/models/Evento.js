import { Favoriteable } from './Favoriteable';
import { partirFechaHora } from '../utils/fechaSemanaSanta';

// Campos alineados con EventoResponse del backend -- 2026-08-15:
// - "descripcion" no existe en el backend (solo historia + tradicion, este
//   último nuevo); se quita.
// - "cofradiaId" único pasa a "cofradiaIds" (N:M real: un evento puede tener
//   varias cofradías participantes, no solo una que lo organiza).
// - "ubicacion" (objeto completo en el mock) pasa a "ubicacionId": el
//   backend solo da el id, resolver el objeto completo queda pendiente
//   (igual que Recorrido en Procesion).
// - "duracionMin" no tiene de dónde salir (el backend solo da un único
//   `fecha`, sin fechaFin para Evento -sí lo tiene Procesion-); se queda
//   siempre null, ya estaba tratado como opcional en las pantallas.
// - fecha/dia/hora se derivan del único `fecha` del backend (ver
//   partirFechaHora) para que HomeScreen/CalenderScreen sigan funcionando
//   sin tocarlas.
// - pasoIds (2026-08-23): "los eventos también pueden tener pasos", no solo
//   las procesiones -la relación se subió a Evento en el backend. Mismo
//   nombre de campo que Procesion.js (pasoIds, no pasosIds) por consistencia
//   entre los dos modelos -no es un typo, ya estaba así en Procesion.js.
export class Evento extends Favoriteable {
  constructor({
    id,
    cofradiaIds = [],
    pasosIds = [],
    nombre,
    historia = null,
    tradicion = null,
    fecha,
    estado,
    ubicacionId = null,
  }) {
    super();
    const partida = partirFechaHora(fecha);
    this.id = id;
    this.cofradiaIds = cofradiaIds; // participan: N Cofradia
    this.pasoIds = pasosIds; // desfilan: N Paso
    this.nombre = nombre;
    this.historia = historia;
    this.tradicion = tradicion;
    this.fecha = partida.fecha;
    this.dia = partida.dia;
    this.hora = partida.hora;
    this.duracionMin = null;
    this.estado = estado;
    this.ubicacionId = ubicacionId; // seCelebraEn: 0..1 Ubicacion
  }

  getFavoritoRef() {
    return { id: this.id, tipo: 'evento' };
  }
}
