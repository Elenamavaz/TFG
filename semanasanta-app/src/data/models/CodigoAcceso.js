import { EstadoCodigo } from './enums';

// Código que una Cofradía emite (genera) y que un Usuario canjea para
// registrarse como Cofrade.
export class CodigoAcceso {
  constructor({
    id,
    codigo,
    fechaEmision = new Date(),
    fechaValidacion = null,
    estado = EstadoCodigo.EMITIDO,
    cofradiaId,
  }) {
    this.id = id;
    this.codigo = codigo;
    this.fechaEmision = fechaEmision;
    this.fechaValidacion = fechaValidacion;
    this.estado = estado;
    this.cofradiaId = cofradiaId; // genera: 1 Cofradia
  }
}
