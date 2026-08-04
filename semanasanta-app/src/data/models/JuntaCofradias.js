export class JuntaCofradias {
  constructor({ id, nombre, email, telefono, ciudadId }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.ciudadId = ciudadId; // gestiona: 1 Ciudad
  }
}
