import { Usuario } from './Usuario';

// Cofrade extiende Usuario y, mientras desfila, puede compartir su
// PosicionActual (relación "comparte", 0..*).
export class Cofrade extends Usuario {
  constructor({ id, fechaIngreso, compartiendoUbicacion = false }) {
    super({ id, fechaIngreso });
    this.compartiendoUbicacion = compartiendoUbicacion;
  }
}
