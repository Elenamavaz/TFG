import { EstadoCodigo } from './enums';

// Código que la Junta emite para una Cofradía y que un cofrade introduce
// para compartir su ubicación durante una procesión (POST /auth/codigo-acceso).
// Campos alineados con CodigoAccesoResponse del backend (2026-10-02): no
// hay fechas de emisión/validación -el backend no las guarda-. El código no
// se gasta: EMITIDO (sin usar) y VALIDADO (ya usado al menos una vez) siguen
// sirviendo para entrar; solo REVOCADO deja de valer.
export class CodigoAcceso {
  constructor({ id, codigo, estado = EstadoCodigo.EMITIDO, cofradiaId }) {
    this.id = id;
    this.codigo = codigo;
    this.estado = estado;
    this.cofradiaId = cofradiaId; // genera: 1 Cofradia
  }

  get activo() {
    return this.estado !== EstadoCodigo.REVOCADO;
  }
}
