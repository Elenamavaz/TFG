// Cuenta de acceso de un miembro de una Junta de Cofradías (rol de gestión,
// no hereda de Usuario: ese árbol modela a las personas que reciben
// notificaciones/favoritos, no a las cuentas de staff con usuario/contraseña).
export class MiembroJuntaCofradia {
  constructor({ usuario, contrasena, juntaCofradiasId }) {
    this.usuario = usuario;
    this.contrasena = contrasena;
    this.juntaCofradiasId = juntaCofradiasId; // gestiona: 1 JuntaCofradias
  }
}
