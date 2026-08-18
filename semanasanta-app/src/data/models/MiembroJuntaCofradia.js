// Campos alineados con MiembroJuntaCofradiaResponse del backend (reescrito
// el 2026-08-17: la versión anterior era de la era Firestore -campos
// "usuario"/"contrasena", comentario "no hereda de Usuario"- y ya no cuadraba
// con nada; MiembroJuntaCofradia SÍ hereda de Usuario en el modelo actual).
// "passwordProvisional" es la señal de "invitación pendiente" del mockup de
// Miembros (sin cambiar la contraseña generada al crear la cuenta);
// "solicitudReactivacionPendiente" es la de "está pidiendo que se le
// reactive" (ver CuentaDesactivadaScreen/SolicitudesReactivacionScreen).
export class MiembroJuntaCofradia {
  constructor({
    id,
    nombre,
    email,
    telefono = null,
    fechaIngreso = null,
    juntaCofradiasId,
    activo = true,
    passwordProvisional = false,
    solicitudReactivacionPendiente = false,
  }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.telefono = telefono;
    this.fechaIngreso = fechaIngreso;
    this.juntaCofradiasId = juntaCofradiasId; // pertenece a: 1 JuntaCofradias
    this.activo = activo;
    this.passwordProvisional = passwordProvisional;
    this.solicitudReactivacionPendiente = solicitudReactivacionPendiente;
  }
}
