import { EstadoCodigo } from './enums';

// Código que la Junta emite para una Cofradía y que un cofrade introduce
// para compartir su ubicación durante una procesión (POST /auth/codigo-acceso).
// Campos alineados con CodigoAccesoResponse del backend. El código no se
// gasta: EMITIDO (sin usar) y VALIDADO (ya usado al menos una vez) siguen
// sirviendo para entrar. Deja de valer si se revoca (REVOCADO) o, desde el
// 2026-10-25 (migración V44 del backend), al caducar: 24 horas después de
// emitirse -"caducado" lo calcula el backend con su propio reloj.
export class CodigoAcceso {
  constructor({ id, codigo, estado = EstadoCodigo.EMITIDO, cofradiaId, fechaEmision = null, fechaExpiracion = null, caducado = false }) {
    this.id = id;
    this.codigo = codigo;
    this.estado = estado;
    this.cofradiaId = cofradiaId; // genera: 1 Cofradia
    this.fechaEmision = fechaEmision;
    this.fechaExpiracion = fechaExpiracion;
    this.caducado = caducado;
  }

  get activo() {
    return this.estado !== EstadoCodigo.REVOCADO && !this.caducado;
  }
}
