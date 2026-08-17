// "activa" añadido el 2026-08-16 (panel de Administrador): NO libera el
// hueco de la ciudad para una Junta nueva -1 Junta por ciudad para siempre,
// desactivar no borra la fila.
export class JuntaCofradias {
  constructor({ id, nombre, email, telefono, ciudadId, activa = true }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.ciudadId = ciudadId; // gestiona: 1 Ciudad
    this.activa = activa;
  }
}
