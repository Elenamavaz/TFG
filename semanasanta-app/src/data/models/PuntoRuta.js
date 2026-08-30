// <<abstract>> PuntoRuta: elemento que compone un Recorrido. PuntoDeInteres
// es su única especialización concreta por ahora.
// Alineado con PuntoRutaResponse del backend -- 2026-08-15: sin
// "horaEnviada" (no existe tal campo en el backend). "orden"/"horaPrevista"
// no son del punto en sí -son de la relación con un Recorrido concreto
// (PuntoEnRecorridoResponse, un mismo punto puede estar en varios
// recorridos con orden distinto)-, pero se aceptan aquí igualmente: quien
// construye el punto a partir de esa relación (ver recorridoService.js) los
// aplana en el propio objeto, para no tener dos clases distintas por ahora.
export class PuntoRuta {
  constructor({ id, ubicacionId = null, orden = null, horaPrevista = null, relacionId = null }) {
    if (new.target === PuntoRuta) {
      throw new Error('PuntoRuta es una clase abstracta: no se puede instanciar directamente.');
    }
    this.id = id;
    this.ubicacionId = ubicacionId;
    this.orden = orden;
    this.horaPrevista = horaPrevista;
    // relacionId (2026-08-23): id de RecorridoPuntoRuta, no del propio punto
    // -hace falta para "marcar como punto de interés" (ver
    // recorridoService.marcarPuntoDeInteres), que actúa sobre la relación
    // con un recorrido concreto, no sobre el punto en sí.
    this.relacionId = relacionId;
  }
}
